out::
	@rm -rf out

compile:: out
	npm run compile


build:: out
	vsce package

publish:: out
	vsce publish

