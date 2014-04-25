bootstrap/lib/std.lthstx.json: bootstrap/lib/std.lthstx
	node bootstrap/src/cli/lthstx.js bootstrap/lib/lthstx.lthstx.json $^ > $@

%.lth.json: bootstrap/lib/std.lthstx.json %.lth
	node bootstrap/src/cli/lthstx.js $^ > $@

%.js: %.lth.json
	node bootstrap/src/cli/lthgen $^ > $@

main.js: bootstrap/lib/runtime.js src/typing.js
	cat $^ > $@
