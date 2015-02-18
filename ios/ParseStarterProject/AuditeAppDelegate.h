//
//  ParseStarterProjectAppDelegate.h
//  ParseStarterProject
//
//  Copyright 2014 Parse, Inc. All rights reserved.
//

#import <Foundation/Foundation.h>

@class AuditeViewController;

@interface AuditeAppDelegate : NSObject <UIApplicationDelegate>

@property (nonatomic, strong) IBOutlet UIWindow *window;

@property (nonatomic, strong) IBOutlet AuditeViewController *viewController;

@end
