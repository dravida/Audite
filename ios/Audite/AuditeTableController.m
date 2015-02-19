//
//  MyTableController.m
//  TextingAudience
//
//  Created by Bryan on 12/19/14.
//
//

#import "AuditeTableController.h"
#import <Parse/Parse.h>

@implementation AuditeTableController

- (PFTableViewCell *)getCell:(UITableView *)tableView {
    static NSString *CellIdentifier = @"Cell";

    PFTableViewCell *cell = (PFTableViewCell *)[tableView dequeueReusableCellWithIdentifier:CellIdentifier];

    if (cell == nil) {
        cell = [[PFTableViewCell alloc] initWithStyle:UITableViewCellStyleSubtitle reuseIdentifier:CellIdentifier];
    }

    return cell;
}

- (id)initWithStyle:(UITableViewStyle)style {
    self = [super initWithStyle:style];

    if (self) {
        self.parseClassName = @"Text";
        self.textKey = @"message";
        self.pullToRefreshEnabled = YES;
        self.paginationEnabled = YES;
        self.objectsPerPage = 25;
    }

    return self;
}

- (BOOL)prefersStatusBarHidden {
    return true;
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation {
    return (interfaceOrientation == UIInterfaceOrientationPortrait);
}

- (PFTableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath object:(PFObject *)object {
    PFTableViewCell *cell = [self getCell:tableView];

    cell.textLabel.numberOfLines = 0;
    cell.textLabel.lineBreakMode = NSLineBreakByWordWrapping;
    cell.textLabel.text = [object objectForKey:@"message"];

    if([[object objectForKey:@"selected"] boolValue]) {
        cell.detailTextLabel.text = @"visible";
        cell.backgroundColor = [UIColor redColor];
    }
    else {
        cell.detailTextLabel.text = @"not visible";
        cell.backgroundColor = [UIColor whiteColor];
    }

    return cell;
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    PFObject* text = self.objects[(NSUInteger) indexPath.row];

    PFTableViewCell *cell = [self getCell:tableView];

    if([[text objectForKey:@"selected"] boolValue]) {
        [text setObject:@NO forKey:@"selected"];

        cell.backgroundColor = [UIColor whiteColor];
    }
    else {
        [text setObject:@YES forKey:@"selected"];

        cell.backgroundColor = [UIColor redColor];
    }

    [text saveInBackground];

    [super tableView:tableView didSelectRowAtIndexPath:indexPath];

    [self.tableView reloadData];
}

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath {
    return 80;
}

@end
