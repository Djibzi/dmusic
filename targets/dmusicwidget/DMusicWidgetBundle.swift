import SwiftUI
import WidgetKit

@main
struct DMusicWidgetBundle: WidgetBundle {
    var body: some Widget {
        if #available(iOS 16.2, *) {
            DMusicLiveActivity()
        }
    }
}
