import Cocoa

let size = 1024
let image = NSImage(size: NSSize(width: size, height: size))
image.lockFocus()

guard let ctx = NSGraphicsContext.current?.cgContext else {
    exit(1)
}

let rect = CGRect(x: 100, y: 100, width: 824, height: 824)
let squirclePath = CGPath(roundedRect: rect, cornerWidth: 185, cornerHeight: 185, transform: nil)

ctx.saveGState()
ctx.setShadow(offset: CGSize(width: 0, height: -30), blur: 45, color: CGColor(red: 0, green: 0, blue: 0, alpha: 0.55))
ctx.addPath(squirclePath)
ctx.setFillColor(CGColor(red: 0.08, green: 0.08, blue: 0.09, alpha: 1.0))
ctx.fillPath()
ctx.restoreGState()

ctx.saveGState()
ctx.addPath(squirclePath)
ctx.setLineWidth(3)
ctx.setStrokeColor(CGColor(red: 0.22, green: 0.22, blue: 0.25, alpha: 0.9))
ctx.strokePath()
ctx.restoreGState()

ctx.saveGState()
ctx.translateBy(x: 512, y: 512)
ctx.rotate(by: -0.05)

let noteRect = CGRect(x: -260, y: -260, width: 520, height: 520)
let notePath = CGPath(roundedRect: noteRect, cornerWidth: 28, cornerHeight: 28, transform: nil)

ctx.setShadow(offset: CGSize(width: 0, height: -16), blur: 32, color: CGColor(red: 0.95, green: 0.70, blue: 0.10, alpha: 0.25))
ctx.addPath(notePath)
ctx.setFillColor(CGColor(red: 0.12, green: 0.09, blue: 0.04, alpha: 1.0))
ctx.fillPath()

ctx.addPath(notePath)
ctx.setLineWidth(4.5)
ctx.setStrokeColor(CGColor(red: 0.96, green: 0.76, blue: 0.20, alpha: 0.85))
ctx.strokePath()

let line1 = CGPath(roundedRect: CGRect(x: -170, y: 80, width: 340, height: 16), cornerWidth: 8, cornerHeight: 8, transform: nil)
let line2 = CGPath(roundedRect: CGRect(x: -170, y: 15, width: 260, height: 16), cornerWidth: 8, cornerHeight: 8, transform: nil)
let line3 = CGPath(roundedRect: CGRect(x: -170, y: -50, width: 300, height: 16), cornerWidth: 8, cornerHeight: 8, transform: nil)

ctx.setFillColor(CGColor(red: 0.96, green: 0.86, blue: 0.65, alpha: 0.45))
ctx.addPath(line1)
ctx.addPath(line2)
ctx.addPath(line3)
ctx.fillPath()

let sealX: CGFloat = 150
let sealY: CGFloat = -150
ctx.setShadow(offset: CGSize(width: 0, height: -6), blur: 14, color: CGColor(red: 0.95, green: 0.70, blue: 0.10, alpha: 0.5))
ctx.setFillColor(CGColor(red: 0.96, green: 0.76, blue: 0.18, alpha: 0.95))
ctx.fillEllipse(in: CGRect(x: sealX - 32, y: sealY - 32, width: 64, height: 64))

let pinX: CGFloat = 0
let pinY: CGFloat = 220
ctx.setShadow(offset: CGSize(width: 0, height: -6), blur: 10, color: CGColor(red: 0, green: 0, blue: 0, alpha: 0.45))
ctx.setFillColor(CGColor(red: 0.95, green: 0.28, blue: 0.35, alpha: 1.0))
ctx.fillEllipse(in: CGRect(x: pinX - 20, y: pinY - 20, width: 40, height: 40))

ctx.restoreGState()

image.unlockFocus()

guard let tiffData = image.tiffRepresentation,
      let bitmap = NSBitmapImageRep(data: tiffData),
      let pngData = bitmap.representation(using: .png, properties: [:]) else {
    exit(1)
}

let fm = FileManager.default
let outDir = URL(fileURLWithPath: CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "macos")
let masterPng = outDir.appendingPathComponent("AppIcon-1024.png")
try! pngData.write(to: masterPng)

let iconsetDir = outDir.appendingPathComponent("AppIcon.iconset")
try? fm.removeItem(at: iconsetDir)
try! fm.createDirectory(at: iconsetDir, withIntermediateDirectories: true)

let sizes: [(String, Int)] = [
    ("icon_16x16.png", 16),
    ("icon_16x16@2x.png", 32),
    ("icon_32x32.png", 32),
    ("icon_32x32@2x.png", 64),
    ("icon_128x128.png", 128),
    ("icon_128x128@2x.png", 256),
    ("icon_256x256.png", 256),
    ("icon_256x256@2x.png", 512),
    ("icon_512x512.png", 512),
    ("icon_512x512@2x.png", 1024)
]

for (name, px) in sizes {
    let dest = iconsetDir.appendingPathComponent(name).path
    let process = Process()
    process.executableURL = URL(fileURLWithPath: "/usr/bin/sips")
    process.arguments = ["-z", "\(px)", "\(px)", masterPng.path, "--out", dest]
    try! process.run()
    process.waitUntilExit()
}

let icnsPath = outDir.appendingPathComponent("AppIcon.icns")
let iconutil = Process()
iconutil.executableURL = URL(fileURLWithPath: "/usr/bin/iconutil")
iconutil.arguments = ["-c", "icns", iconsetDir.path, "-o", icnsPath.path]
try! iconutil.run()
iconutil.waitUntilExit()

try? fm.removeItem(at: iconsetDir)
try? fm.removeItem(at: masterPng)
