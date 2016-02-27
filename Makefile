# @Author: Robustly.io <m0ser>
# @Date:   2016-02-26T22:48:58-05:00
# @Email:  m0ser@robustly.io
# @Last modified by:   m0ser
# @Last modified time: 2016-02-27T18:30:46-05:00
# @License: Apache-2.0



ISTANBUL=node_modules/.bin/istanbul
UNIT_TEST_FILES=$(shell find . -name "*.spec.js" -not -path "./node_modules/*")
INT_TEST_FILES=$(shell find . -name "*.int.js" -not -path "./node_modules/*")
API_TEST_FILES=$(shell find . -name "*.api.js" -not -path "./node_modules/*")
MOCHA_ARGS=--bail -u bdd -r test/config.js --timeout 20000
MOCHA=@./node_modules/.bin/mocha ${MOCHA_ARGS}
SEMVER?=patch

unit:
	${MOCHA} ${UNIT_TEST_FILES} ${ARGS}

int:
	${MOCHA} ${INT_TEST_FILES} ${ARGS}

api:
	${MOCHA} ${API_TEST_FILES} ${ARGS}

coverage:
	$(ISTANBUL) cover node_modules/.bin/_mocha -- ${MOCHA_ARGS} ${ARGS} ${UNIT_TEST_FILES} ${INT_TEST_FILES}

viewCov:
	open coverage/lcov-report/index.html

all: unit int api

publish:
	git commit -am ${MSG}
	gulp ${SEMVER}
	git push origin master --tags
	npm publish

.PHONY: unit int coverage viewCov all
