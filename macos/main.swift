import Cocoa
import WebKit

final class SchemeHandler: NSObject, WKURLSchemeHandler {
    private let distURL: URL

    init(distURL: URL) {
        self.distURL = distURL
        super.init()
    }

    func webView(_ webView: WKWebView, start urlSchemeTask: WKURLSchemeTask) {
        guard let url = urlSchemeTask.request.url else {
            urlSchemeTask.didFailWithError(URLError(.badURL))
            return
        }

        var relativePath = url.path
        if relativePath.isEmpty || relativePath == "/" {
            relativePath = "/index.html"
        }

        let cleanPath = relativePath.trimmingCharacters(in: CharacterSet(charactersIn: "/"))
        let fileURL = distURL.appendingPathComponent(cleanPath)

        guard FileManager.default.fileExists(atPath: fileURL.path),
              let data = try? Data(contentsOf: fileURL) else {
            let notFound = HTTPURLResponse(
                url: url,
                statusCode: 404,
                httpVersion: "HTTP/1.1",
                headerFields: ["Content-Type": "text/plain; charset=utf-8"]
            )!
            urlSchemeTask.didReceive(notFound)
            urlSchemeTask.didReceive(Data("404 Not Found".utf8))
            urlSchemeTask.didFinish()
            return
        }

        let mimeType = mimeTypeFor(pathExtension: fileURL.pathExtension)
        let response = HTTPURLResponse(
            url: url,
            statusCode: 200,
            httpVersion: "HTTP/1.1",
            headerFields: [
                "Content-Type": mimeType,
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "no-cache"
            ]
        )!

        urlSchemeTask.didReceive(response)
        urlSchemeTask.didReceive(data)
        urlSchemeTask.didFinish()
    }

    func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) {}

    private func mimeTypeFor(pathExtension: String) -> String {
        switch pathExtension.lowercased() {
        case "html", "htm":
            return "text/html; charset=utf-8"
        case "js", "mjs":
            return "application/javascript; charset=utf-8"
        case "css":
            return "text/css; charset=utf-8"
        case "json":
            return "application/json; charset=utf-8"
        case "svg":
            return "image/svg+xml"
        case "png":
            return "image/png"
        case "jpg", "jpeg":
            return "image/jpeg"
        case "gif":
            return "image/gif"
        case "webp":
            return "image/webp"
        case "ico":
            return "image/x-icon"
        case "woff2":
            return "font/woff2"
        case "woff":
            return "font/woff"
        case "ttf":
            return "font/ttf"
        case "mp3":
            return "audio/mpeg"
        case "wav":
            return "audio/wav"
        case "ogg":
            return "audio/ogg"
        default:
            return "application/octet-stream"
        }
    }
}

final class StickyWindow: NSWindow {
    override func performKeyEquivalent(with event: NSEvent) -> Bool {
        if event.modifierFlags.contains(.command) && event.charactersIgnoringModifiers == "w" {
            performClose(nil)
            return true
        }
        return super.performKeyEquivalent(with: event)
    }
}

final class AppDelegate: NSObject, NSApplicationDelegate, NSWindowDelegate {
    private var window: StickyWindow!
    private var webView: WKWebView!
    private var isTerminating = false

    func applicationDidFinishLaunching(_ notification: Notification) {
        setupMainMenu()
        setupWindow()
        loadApp()
    }

    func applicationShouldHandleReopen(_ sender: NSApplication, hasVisibleWindows flag: Bool) -> Bool {
        if !flag {
            window.makeKeyAndOrderFront(nil)
            NSApp.activate(ignoringOtherApps: true)
        }
        return true
    }

    func applicationWillTerminate(_ notification: Notification) {
        isTerminating = true
    }

    func windowShouldClose(_ sender: NSWindow) -> Bool {
        if isTerminating {
            return true
        }
        sender.orderOut(nil)
        return false
    }

    private func setupWindow() {
        let screenRect = NSScreen.main?.visibleFrame ?? NSRect(x: 0, y: 0, width: 1440, height: 900)
        let initialWidth = min(1120.0, screenRect.width * 0.85)
        let initialHeight = min(780.0, screenRect.height * 0.85)
        let initialRect = NSRect(
            x: screenRect.midX - initialWidth / 2,
            y: screenRect.midY - initialHeight / 2,
            width: initialWidth,
            height: initialHeight
        )

        window = StickyWindow(
            contentRect: initialRect,
            styleMask: [.titled, .closable, .miniaturizable, .resizable],
            backing: .buffered,
            defer: false
        )

        window.title = "Sticky"
        window.isMovable = true
        window.isMovableByWindowBackground = true
        window.backgroundColor = NSColor(red: 10/255, green: 10/255, blue: 10/255, alpha: 1.0)
        window.appearance = NSAppearance(named: .darkAqua)
        window.minSize = NSSize(width: 720, height: 480)
        window.setFrameAutosaveName("StickyMainWindow")
        window.delegate = self

        let config = WKWebViewConfiguration()
        let distURL = locateDistURL()
        let schemeHandler = SchemeHandler(distURL: distURL)
        config.setURLSchemeHandler(schemeHandler, forURLScheme: "sticky")
        config.preferences.setValue(true, forKey: "developerExtrasEnabled")

        webView = WKWebView(frame: window.contentView?.bounds ?? .zero, configuration: config)
        webView.autoresizingMask = [.width, .height]
        webView.allowsBackForwardNavigationGestures = false
        webView.setValue(false, forKey: "drawsBackground")

        if #available(macOS 13.3, *) {
            webView.isInspectable = true
        }

        window.contentView?.addSubview(webView)
        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }

    private func loadApp() {
        guard let url = URL(string: "sticky://app/index.html") else { return }
        webView.load(URLRequest(url: url))
    }

    private func locateDistURL() -> URL {
        if let bundleResource = Bundle.main.url(forResource: "dist", withExtension: nil) {
            return bundleResource
        }
        let cwd = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
        let localDist = cwd.appendingPathComponent("dist")
        if FileManager.default.fileExists(atPath: localDist.path) {
            return localDist
        }
        let parentDist = cwd.appendingPathComponent("../dist")
        if FileManager.default.fileExists(atPath: parentDist.path) {
            return parentDist
        }
        return localDist
    }

    private func setupMainMenu() {
        let mainMenu = NSMenu()

        let appMenuItem = NSMenuItem()
        let appMenu = NSMenu(title: "Sticky")
        appMenu.addItem(withTitle: "About Sticky", action: #selector(NSApplication.orderFrontStandardAboutPanel(_:)), keyEquivalent: "")
        appMenu.addItem(NSMenuItem.separator())
        appMenu.addItem(withTitle: "Hide Sticky", action: #selector(NSApplication.hide(_:)), keyEquivalent: "h")
        let hideOthersItem = NSMenuItem(title: "Hide Others", action: #selector(NSApplication.hideOtherApplications(_:)), keyEquivalent: "h")
        hideOthersItem.keyEquivalentModifierMask = [.command, .option]
        appMenu.addItem(hideOthersItem)
        appMenu.addItem(withTitle: "Show All", action: #selector(NSApplication.unhideAllApplications(_:)), keyEquivalent: "")
        appMenu.addItem(NSMenuItem.separator())
        appMenu.addItem(withTitle: "Quit Sticky", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        appMenuItem.submenu = appMenu
        mainMenu.addItem(appMenuItem)

        let fileMenuItem = NSMenuItem()
        let fileMenu = NSMenu(title: "File")
        let closeItem = NSMenuItem(title: "Close Window", action: #selector(NSWindow.performClose(_:)), keyEquivalent: "w")
        fileMenu.addItem(closeItem)
        fileMenuItem.submenu = fileMenu
        mainMenu.addItem(fileMenuItem)

        let editMenuItem = NSMenuItem()
        let editMenu = NSMenu(title: "Edit")
        editMenu.addItem(withTitle: "Undo", action: #selector(UndoManager.undo), keyEquivalent: "z")
        let redoItem = NSMenuItem(title: "Redo", action: #selector(UndoManager.redo), keyEquivalent: "Z")
        editMenu.addItem(redoItem)
        editMenu.addItem(NSMenuItem.separator())
        editMenu.addItem(withTitle: "Cut", action: #selector(NSText.cut(_:)), keyEquivalent: "x")
        editMenu.addItem(withTitle: "Copy", action: #selector(NSText.copy(_:)), keyEquivalent: "c")
        editMenu.addItem(withTitle: "Paste", action: #selector(NSText.paste(_:)), keyEquivalent: "v")
        editMenu.addItem(withTitle: "Select All", action: #selector(NSText.selectAll(_:)), keyEquivalent: "a")
        editMenuItem.submenu = editMenu
        mainMenu.addItem(editMenuItem)

        let viewMenuItem = NSMenuItem()
        let viewMenu = NSMenu(title: "View")
        let reloadItem = NSMenuItem(title: "Reload", action: #selector(reloadApp), keyEquivalent: "r")
        reloadItem.target = self
        viewMenu.addItem(reloadItem)
        let fullScreenItem = NSMenuItem(title: "Toggle Full Screen", action: #selector(NSWindow.toggleFullScreen(_:)), keyEquivalent: "f")
        fullScreenItem.keyEquivalentModifierMask = [.command, .control]
        viewMenu.addItem(fullScreenItem)
        viewMenuItem.submenu = viewMenu
        mainMenu.addItem(viewMenuItem)

        let windowMenuItem = NSMenuItem()
        let windowMenu = NSMenu(title: "Window")
        windowMenu.addItem(withTitle: "Minimize", action: #selector(NSWindow.performMiniaturize(_:)), keyEquivalent: "m")
        windowMenu.addItem(withTitle: "Zoom", action: #selector(NSWindow.performZoom(_:)), keyEquivalent: "")
        windowMenu.addItem(NSMenuItem.separator())
        windowMenu.addItem(withTitle: "Bring All to Front", action: #selector(NSApplication.arrangeInFront(_:)), keyEquivalent: "")
        windowMenuItem.submenu = windowMenu
        mainMenu.addItem(windowMenuItem)

        NSApp.mainMenu = mainMenu
    }

    @objc private func reloadApp() {
        guard let url = URL(string: "sticky://app/index.html") else { return }
        webView.load(URLRequest(url: url))
    }
}

@main
struct StickyApp {
    private static let delegate = AppDelegate()

    static func main() {
        let app = NSApplication.shared
        app.delegate = delegate
        app.setActivationPolicy(.regular)
        app.run()
    }
}
