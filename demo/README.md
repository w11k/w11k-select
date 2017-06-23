# Demo Repository for [w11k-Select](https://github.com/w11k/w11k-select)

w11k-select is an AngularJS directive created to replace the default HTML select element which has a poor usability for most use cases particularly in desktop browsers.


Features:

* Single- and multi-select
* High performance and usability even with hundreds of options
* Filter options to find the right one quickly
* Uses Twitter Bootstrap markup / styling, comes with default css but easy to adjust / override
* Disabled state and required-validation
* Customisable texts (placeholders and selected representation)

## Documentation and Demo

See Project Website at http://w11k.github.com/w11k-select

## Development Setup

1. Clone [w11k-Select repository](https://github.com/w11k/w11k-select)
1. Switch into directory `cd w11k-select `
1. Install dependencies `yarn install`
1. Run build once `yarn run build` 
1. Create npm link `yarn link`
1. Clone demo (this) repository
1. Switch into directory `cd w11k-select-demo`
1. Install dependencies `yarn install`
1. Link w11k-select to local repo `yarn link "w11k-select"`
1. Done. Fire it up with `yarn start` [http://localhost:8080](http://localhost:8080)

## License

see LICENSE file
