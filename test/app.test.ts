import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import type { Server } from 'bun';
import { createDevServer } from '../vite';

describe('abnormal freeform sticky note canvas', () => {
  let server: Server<unknown>;
  let webview: Bun.WebView;

  beforeAll(async () => {
    server = createDevServer(0, false);
    webview = new Bun.WebView();
    await webview.navigate(`http://localhost:${server.port}`);
  });

  afterAll(async () => {
    await webview.close();
    server.stop(true);
  });

  test('renders desk void and physical notes', async () => {
    const state = (await webview.evaluate(`(async () => {
      while (!document.querySelector('#desk-void')) {
        await new Promise(r => setTimeout(r, 10));
      }
      return {
        hasDesk: !!document.querySelector('#desk-void'),
        hasPadStack: !!document.querySelector('#pad-stack'),
        noteCount: document.querySelectorAll('article').length,
      };
    })()`)) as {
      hasDesk: boolean;
      hasPadStack: boolean;
      noteCount: number;
    };

    expect(state.hasDesk).toBe(true);
    expect(state.hasPadStack).toBe(true);
    expect(state.noteCount).toBeGreaterThanOrEqual(1);
  });

  test('peels new note when pad stack is tapped', async () => {
    const result = (await webview.evaluate(`(() => {
      const initialCount = document.querySelectorAll('article').length;
      const pad = document.querySelector('#pad-stack');
      if (pad) pad.click();
      const newCount = document.querySelectorAll('article').length;
      return { initialCount, newCount };
    })()`)) as { initialCount: number; newCount: number };

    expect(result.newCount).toBe(result.initialCount + 1);
  });

  test('sticked (pinned) notes remain anchored when other notes move', async () => {
    const result = (await webview.evaluate(`(() => {
      const pinnedArticle = document.querySelector('article[data-note-id="note-legendary-1"]');
      const initialTransform = pinnedArticle ? pinnedArticle.style.transform : '';

      const unpinnedArticle = document.querySelector('article[data-note-id="note-epic-1"]');
      if (unpinnedArticle) {
        unpinnedArticle.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 200, clientY: 200 }));
        window.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 190, clientY: 120 }));
        window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
      }

      const postTransform = pinnedArticle ? pinnedArticle.style.transform : '';
      return { initialTransform, postTransform };
    })()`)) as { initialTransform: string; postTransform: string };

    expect(result.initialTransform).toBe(result.postTransform);
  });

  test('elevates z-index when focused', async () => {
    const result = (await webview.evaluate(`(() => {
      const article = document.querySelector('article[data-note-id="note-common-1"]');
      const input = article ? article.querySelector('input') : null;
      if (input) input.focus();
      return window.getComputedStyle(article).zIndex;
    })()`)) as string;

    expect(Number(result)).toBeGreaterThanOrEqual(20);
  });

  test('triggers distinct disappearance animation on delete', async () => {
    const result = (await webview.evaluate(`(() => {
      const article = document.querySelector('article[data-note-id="note-common-1"]');
      const deleteBtn = article ? article.querySelector('button[title="Burn note into ash"]') : null;
      if (deleteBtn) deleteBtn.click();
      return {
        hasAnimation: article ? article.style.animation.includes('crumble-common') : false,
      };
    })()`)) as { hasAnimation: boolean };

    expect(result.hasAnimation).toBe(true);
  });
});
