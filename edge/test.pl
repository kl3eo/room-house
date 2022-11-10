#!/usr/bin/perl
use JSON;

#curl -H "Content-Type: application/json" -d '{"id":1, "jsonrpc":"2.0", "method": "system_peers"}' http://localhost:9933/ | jq -r '.result'

my $str = `curl --silent -H "Content-Type: application/json" -d '{"id":1, "jsonrpc":"2.0", "method": "system_peers"}' http://localhost:8482/`;

my $json = '{
        "name": "Bob",
        "sex": "Male",
        "address": {
                "city": "San Jose",
                "state": "California"
        },
        "friends":
                [
                        {
                                "name": "Alice",
                                "age": "20"
                        },
                        {
                                "name": "Laura",
                                "age": "23"
                        },
                        {
                                "name": "Daniel",
                                "age": "30"
                        }
                ]
}';


my $decoded = decode_json($str);
#print "City = " . $decoded->{'address'}{'city'} . "n";


my @nj = @{ $decoded->{'result'} };
my @unsorted_nodes = ();

foreach my $f (@nj) {
        push @unsorted_nodes, $f->{"peerId"};
	push @unsorted_nodes, $f->{"bestNumber"};
}


my %h = @unsorted_nodes;


my @keys = sort { $h{$a} <=> $h{$b} } keys(%h);
#my @vals = @h{@keys};
				
	foreach my $cline (@keys) {
		print $cline." ".$h{$cline}."\n";
	}
