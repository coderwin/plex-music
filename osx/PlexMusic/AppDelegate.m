#import "AppDelegate.h"

#import "RCTBridge.h"
#import "RCTEventDispatcher.h"
#import "RCTJavaScriptLoader.h"
#import "RCTRootView.h"
#import <Cocoa/Cocoa.h>

@interface AppDelegate() <RCTBridgeDelegate, NSSearchFieldDelegate>

@end

@implementation AppDelegate

-(id)init
{
    if(self = [super init]) {
      NSRect contentSize = NSMakeRect(200, 500, 1000, 500); // initial size of main NSWindow

      self.window = [[NSWindow alloc] initWithContentRect:contentSize
                                                styleMask:NSTitledWindowMask | NSResizableWindowMask | NSMiniaturizableWindowMask | NSClosableWindowMask | NSFullSizeContentViewWindowMask
                                                  backing:NSBackingStoreBuffered
                                                    defer:NO];
    
          
      NSWindowController *windowController = [[NSWindowController alloc] initWithWindow:self.window];

      [[self window] setTitleVisibility:NSWindowTitleHidden];
      [[self window] setTitlebarAppearsTransparent:YES];
      [[self window] setAppearance:[NSAppearance appearanceNamed:NSAppearanceNameVibrantLight]];

      [windowController showWindow:self.window];
      [windowController setShouldCascadeWindows:NO];
      [windowController setWindowFrameAutosaveName:@"Plex Music"];

      NSToolbar *toolbar = [[NSToolbar alloc] initWithIdentifier:@"Toolbar"];
      [toolbar setDelegate:self];
      [toolbar setSizeMode:NSToolbarSizeModeRegular];
      [self.window setToolbar:toolbar];

      [self setUpApplicationMenu];
    }
    return self;
}

- (NSToolbarItem *)toolbar:(NSToolbar * __unused)toolbar itemForItemIdentifier:(NSString *)itemIdentifier willBeInsertedIntoToolbar:(BOOL __unused)flag {
  if ([itemIdentifier isEqualToString:@"SearchBar"]) {
    NSSearchField *searchField = [[NSSearchField alloc] init];
    [searchField setFrameSize:NSMakeSize(400, searchField.intrinsicContentSize.height)];
    [searchField setDelegate:self];
    [searchField setRecentsAutosaveName:@"search"];
    [searchField setPlaceholderString:@"Search..."];
    [searchField setAction:@selector(handleOnSearch:)];
    NSToolbarItem *item = [[NSToolbarItem alloc] initWithItemIdentifier:itemIdentifier];
    [item setView:searchField];
    return item;
  }
  
  return nil;
}


- (NSArray *)toolbarAllowedItemIdentifiers:(__unused NSToolbar *)toolbar
{
  return @[ NSToolbarFlexibleSpaceItemIdentifier, @"SearchBar"];
}

- (NSArray *)toolbarDefaultItemIdentifiers:(__unused NSToolbar *)toolbar
{
  return @[NSToolbarFlexibleSpaceItemIdentifier, @"SearchBar", NSToolbarFlexibleSpaceItemIdentifier];
}


- (IBAction)handleOnSearch:(id)sender {
  [_bridge.eventDispatcher sendDeviceEventWithName:@"Search" body:[sender stringValue]];
}


- (void)applicationDidFinishLaunching:(__unused NSNotification *)aNotification
{

    _bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:nil];
    RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:_bridge moduleName:@"Application" initialProperties:nil];
    [self.window setContentView:rootView];
}


- (NSURL *)sourceURLForBridge:(__unused RCTBridge *)bridge
{
    NSURL *sourceURL;

#if DEBUG
    sourceURL = [NSURL URLWithString:@"http://localhost:8081/index.osx.bundle?platform=osx&dev=true"];
#else
    sourceURL = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif

    return sourceURL;
}

- (void)loadSourceForBridge:(RCTBridge *)bridge
                  withBlock:(RCTSourceLoadBlock)loadCallback
{
    [RCTJavaScriptLoader loadBundleAtURL:[self sourceURLForBridge:bridge]
                              onComplete:loadCallback];
}


- (void)setUpApplicationMenu
{
    NSMenuItem *containerItem = [[NSMenuItem alloc] init];
    NSMenu *rootMenu = [[NSMenu alloc] initWithTitle:@"" ];
    [containerItem setSubmenu:rootMenu];
    [rootMenu addItemWithTitle:@"Quit Plex Music" action:@selector(terminate:) keyEquivalent:@"q"];
    [[NSApp mainMenu] addItem:containerItem];
}

- (id)firstResponder
{
    return [self.window firstResponder];
}

@end
