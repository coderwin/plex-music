#import "AppDelegate.h"

#import "RCTBridge.h"
#import "RCTEventDispatcher.h"
#import "RCTJavaScriptLoader.h"
#import "RCTRootView.h"
#import <Cocoa/Cocoa.h>

@interface AppDelegate() <RCTBridgeDelegate>
@property (nonatomic, strong) NSWindowController* windowController;
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
    
          
      self.windowController = [[NSWindowController alloc] initWithWindow:self.window];

      [[self window] setTitleVisibility:NSWindowTitleHidden];
      [[self window] setTitlebarAppearsTransparent:YES];
      [[self window] setAppearance:[NSAppearance appearanceNamed:NSAppearanceNameVibrantLight]];

      [_windowController showWindow:self.window];
      [_windowController setShouldCascadeWindows:NO];
      [_windowController setWindowFrameAutosaveName:@"Plex Music"];

      [self setUpApplicationMenu];
    }
    return self;
}

-(BOOL)applicationShouldHandleReopen:(NSApplication *)sender hasVisibleWindows:(BOOL)flag
{
  [self.windowController showWindow:self.window];
  return !flag;
}

-(void) applicationDidBecomeActive:(NSNotification *)notification
{
  [self.windowController showWindow:self.window];
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
    [rootMenu addItemWithTitle:@"Quit" action:@selector(terminate:) keyEquivalent:@"q"];
    [[NSApp mainMenu] addItem:containerItem];

    NSMenuItem *editItemContainer = [[NSMenuItem alloc] init];
    NSMenu *editMenu = [[NSMenu alloc] initWithTitle:@"Edit"];
    [editItemContainer setSubmenu:editMenu];
    [editMenu setAutoenablesItems:NO];
    [editMenu addItem:[self addEditMenuItem:@"Undo" action:@selector(undo) key:@"z" ]];
    [editMenu addItem:[self addEditMenuItem:@"Redo" action:@selector(redo) key:@"Z" ]];
    [editMenu addItem:[self addEditMenuItem:@"Cut" action:@selector(cut:) key:@"x" ]];
    [editMenu addItem:[self addEditMenuItem:@"Copy" action:@selector(copy:) key:@"c" ]];
    [editMenu addItem:[self addEditMenuItem:@"Paste" action:@selector(paste:) key:@"v" ]];
    [editMenu addItem:[self addEditMenuItem:@"SelectAll" action:@selector(selectAll:) key:@"a" ]];
    [[NSApp mainMenu] addItem:editItemContainer];

}

- (id)firstResponder
{
    return [self.window firstResponder];
}


- (NSMenuItem *)addEditMenuItem:(NSString *)title
                         action:(SEL _Nullable)action
                            key:(NSString *)key
{
  NSMenuItem * menuItem = [[NSMenuItem alloc] init];
  [menuItem setTitle:title];
  [menuItem setEnabled:YES];
  [menuItem setAction:action];
  [menuItem setKeyEquivalent:key];
  return menuItem;
}

- (void)undo
{
  [[[self window] undoManager] undo];
}

- (void)redo
{
  [[[self window] undoManager] redo];
}

@end
