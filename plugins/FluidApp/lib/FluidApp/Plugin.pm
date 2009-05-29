# Fluid App - Movable Type Plugin
# Copyright (C) 2008 Byrne Reese
# Licensed under the same terms as Perl itself

package FluidApp::Plugin;

use strict;

use Carp qw( croak );
use MT::Util qw( epoch2ts );

sub xfrm_header {
    my ($cb, $app, $html_ref) = @_;
    $$html_ref =~ s{</head>}{<script type="text/javascript" src="<mt:var name="static_uri">plugins/FluidApp/fluid.js"></script></head>}m;
}

sub cms_update {
    my $app = shift;
    my $q = $app->{query};
    require MT::Comment;
    my $now = time;
    $now = epoch2ts( $blog, $now );
    my @growls;
    if ($q->param('since') && $q->param('since') ne '') {
	my @comments = MT::Comment->load({ created_on => { ">=" => $q->param('since') }, junk_status => 1, },
					 { limit => 10, sort => "created_on" });
	foreach my $c (@comments) {
	    if ($c->visible) {
		push @growls, { title => sprintf("New Comment"), 
				description => sprintf("%s posted a comment on %s",$c->author,$c->blog->name), 
				blog_id => $c->blog->id };
	    } else {
		push @growls, { title => sprintf("New Comment on %s",$c->blog->name), 
				description => sprintf("A comment from %s is being held for moderation on %s",$c->author,$c->blog->name),
				blog_id => $c->blog->id };
	    }
	}
    }
    my $count = MT::Comment->count({ visible => 0, junk_status => 1, });
    return $app->json_result({ 
	label => 'Comments in moderation',
	count => $count, 
	since => $now,
	growls => \@growls,
    });
}

1;
