# Release notes

## 0.4.0
Upgrade to deno version 1.25.2
Update all std to 0.115.0

`rawBodyPipe` fill state with body string
`jsonBodyPipe`use native json method

### Depricated
ServerRequest not more exists, use Request
Not support for deno 1.25.x and lower or not testet

## 0.2.12

Integrate plugin swagger and refactorings update swagger plugin with definitions
by prop

## 0.2.11

Bugfixes

## 0.2.10

Bugfixes and upgrade sources

## 0.2.9

Add more event types for route

- API_ADD_ROUTE
- AFTER_ROUTE_RESPONSE

## 0.2.8

Bugfixes

## 0.2.7

integrate new events

- BEFORE_ROUTE
- BEFORE_REQUEST
- ROUTE_NOT_FOUND

## 0.2.3 - 0.2.6

hotfixes and optimization

## v0.2.2

- integrate cache control attributes for file pipe as optional parameter
- optional parameter for filePipe for statuscode
- add some tests

## v0.2.1

- remove extend method for pattern map (`extendPatternMap`)
- integrate new `describe` attribute for KeyMatch params (example exists)
- add Hash pattern for KeyMap

## v0.2.0

- add file handling
- add functionality for breaking pipe process
- add new example to handle files
  [File example](https://deno.land/x/deno_api_server/example/static-file.ts)

## 0.0.18 > 0.1.0

- KeyMatch not support Number type anymore use EPatternTypes or the string value
