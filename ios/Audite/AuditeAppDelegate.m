//
//  AuditeAppDelegate.m
//  Audite
//
//  Copyright 2014 Parse, Inc. All rights reserved.
//

#import "AuditeAppDelegate.h"
#import "AuditeTableController.h"
#import "ParseInit.h"

@implementation AuditeAppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    [ParseInit initApplication];

    self.window = [[UIWindow alloc] initWithFrame:[[UIScreen mainScreen] bounds]]; // to avoid MainWindow.xib requirement

    AuditeTableController *auditeTableController = [[AuditeTableController alloc] init];

    self.window.rootViewController = auditeTableController;

    [self.window makeKeyAndVisible];

    return YES;
}

@end
