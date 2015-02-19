//
//  MyTableController.m
//  TextingAudience
//
//  Created by Bryan on 12/19/14.
//
//

#import "AuditeTableController.h"
#import <Parse/Parse.h>

@interface AuditeTableController ()

@end

@implementation AuditeTableController

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

#pragma mark - UIViewController

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation {
    return (interfaceOrientation == UIInterfaceOrientationPortrait);
}

#pragma mark - PFQueryTableViewController
 
- (void)objectsWillLoad {
    [super objectsWillLoad];
}
 
- (void)objectsDidLoad:(NSError *)error {
    [super objectsDidLoad:error];
}
 
- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath object:(PFObject *)object {
    static NSString *CellIdentifier = @"Cell";
    
    PFTableViewCell *cell = (PFTableViewCell *)[tableView dequeueReusableCellWithIdentifier:CellIdentifier];
    if (cell == nil) {
        cell = [[PFTableViewCell alloc] initWithStyle:UITableViewCellStyleSubtitle reuseIdentifier:CellIdentifier];
    }

	cell.textLabel.numberOfLines = 0;
	cell.textLabel.lineBreakMode = NSLineBreakByWordWrapping;
    cell.textLabel.text = [object objectForKey:@"message"];

	if([[object objectForKey:@"selected"] boolValue ]) {
	    cell.detailTextLabel.text = @"visible";
		cell.backgroundColor = [UIColor redColor];
	}
	else {
		cell.detailTextLabel.text = @"not visible";
		cell.backgroundColor = [UIColor whiteColor];
	}

	return cell;
}

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath
{
	return 80;
}

#pragma mark - UITableViewDataSource

#pragma mark - UITableViewDelegate
 
- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {

	static NSString *CellIdentifier = @"Cell";
    
    PFTableViewCell *cell = (PFTableViewCell *)[tableView dequeueReusableCellWithIdentifier:CellIdentifier];
    if (cell == nil) {
        cell = [[PFTableViewCell alloc] initWithStyle:UITableViewCellStyleSubtitle reuseIdentifier:CellIdentifier];
    }


    [super tableView:tableView didSelectRowAtIndexPath:indexPath];

	PFObject* object = [self.objects objectAtIndex:indexPath.row];

	if([[object objectForKey:@"selected"] boolValue ]) {
		[object setObject:[NSNumber numberWithBool:NO] forKey:@"selected"];
		cell.backgroundColor = [UIColor whiteColor];
	}
	else {
		[object setObject:[NSNumber numberWithBool:YES] forKey:@"selected"];
		cell.backgroundColor = [UIColor redColor];
	}

	[object saveInBackground];

	[self.tableView reloadData];

}

-(BOOL)prefersStatusBarHidden {return true;}

@end
