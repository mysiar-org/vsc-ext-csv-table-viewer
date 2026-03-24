compile::
	npm run compile

build::
	vsce package

publish::
	vsce publish

pre-build::
	vsce package --pre-release

pre-publish::
	vsce publish --pre-release