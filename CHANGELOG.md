# w11k-select Changelog

<a name="0.11.1"></a>
## 0.11.1 (2017-09-25)


### Bug Fixes

* **directive:** fix call of method without this-binding ([c29bee9](https://github.com/w11k/w11k-select/commit/c29bee9))


<a name="0.11.0"></a>
## 0.11.0 (2017-09-25)


### Bug Fixes

* **bower:** fix main file in bower.json ([ecb6af8](https://github.com/w11k/w11k-select/commit/ecb6af8))
* **config:** accept empty strings as static texts ([3b6c2b0](https://github.com/w11k/w11k-select/commit/3b6c2b0))
* **config:** fix usage of maxHeight ([efb86bc](https://github.com/w11k/w11k-select/commit/efb86bc))


### Features

* **single-select:** add option to force array output for single-select mode ([95975af](https://github.com/w11k/w11k-select/commit/95975af))


<a name="0.10.5"></a>
## 0.10.5 (2017-07-20)

### Bug Fixes
* **binding:** removes onetime-binding in order to enable external change of input data ([77b1c26](https://github.com/w11k/w11k-select/commit/77b1c263fa769f0d3ec305ff6d58286c1f5bc9e0))

<a name="0.10.4"></a>
## 0.10.4 (2017-07-18)

### Bug Fixes

* **select:** enable hierarchical pre-select ([d7866c3](https://github.com/w11k/w11k-select/commit/d7866c3fcc7cbc371d8917440c6b242645499df4))

<a name="0.10.3"></a>
## 0.10.3 (2017-06-23)


### Bug Fixes

* **css:** prefix classes ([7ea2499](https://github.com/w11k/w11k-select/commit/7ea24994e16a37c3ecc7aa2ae457491c2b3b973c))


<a name="0.10.2"></a>
## 0.10.2 (2017-05-25)


### Bug Fixes

* **project:** fix angular dependency (>1.3.0)


<a name="0.10.1"></a>
## 0.10.1 (2017-05-25)


### Bug Fixes

* **css:** fixed import path in less
* **css:** set hover and active font color 

<a name="0.10.0"></a>
## 0.10.0 (2017-05-19)


### Features

* **project:** migrated project to TypeScript ([e164fc3](https://github.com/w11k/w11k-select/commit/e164fc39bd3a1e7452ef1ad1acb076ea84f6babb))

### Breaking Changes

* Assets (HTML, CSS, LESS, SCSS) assets moved to `/dist`
* Added w11k-select-option.tpl.html

<a name="0.9.1"></a>
## 0.9.1 (2017-05-02)

### Bug Fixes

* **ngInject:** added missing array notation to controller  ([d1df4dc](https://github.com/w11k/w11k-select/commit/d1df4dcfada97b7dc3a3f47896ed7ab650cfe894))
* **api:** enable collection source to start with $  ([11fd01f](https://github.com/w11k/w11k-select/commit/11fd01fa0e7a31b9104543a2ebd54ce0b52fe85e))


<a name="0.9.0"></a>
## 0.9.0 (2016-12-12)


### Bug Fixes

* **dependencies:** mark as compatible with ng 1.6 ([5e9f39d](https://github.com/w11k/w11k-select/commit/5e9f39d96eaa0e68f0640b92664617abc43d72da))
* **hide-checkboxes:** fix css selector to hide check boxes via config ([20d7929](https://github.com/w11k/w11k-select/commit/20d79293ba0bea3ba85d948bfacb11c06c4fb287))
* **filter:** show unfiltered options on re-open ([802047e](https://github.com/w11k/w11k-select/commit/802047e2862eb47c507fa6a75612f6cca51f7c44))


### Features

* **api:** expose controller with open, close and toggle function via w11k-select attribute value to parent scope ([2b71876](https://github.com/w11k/w11k-select/commit/2b718765c24c19225d06d8cb91654cd49b9b6107))


<a name="0.8.0"></a>
## 0.8.0 (2016-09-27)


### Bug Fixes

* **dependencies:** mark as compatible with ng 1.2 ([1957209f](https://github.com/w11k/w11k-select/commit/1957209f8b1d41aa19468b3770a73a6370e03ee9))


### Features

* **npm:** prepare for publishing via npm ([f95f9f84](https://github.com/w11k/w11k-select/commit/f95f9f8495d80ee915e85fbcf7b9f7625536f491))


<a name="0.7.3"></a>
### 0.7.3 (2016-09-21)

With this version we add support for AngularJS 1.2 again.

#### Bug Fixes

* **ngModel:** use setValidity for Angular < 1.3 and $validators for >= 1.3 ([89b441fd](https://github.com/w11k/w11k-select/commit/89b441fd5ea6cd97138147ccd79a574ce5ea277e))


<a name="0.7.2"></a>
## 0.7.2 (2016-08-09)


### Bug Fixes

* **options:** fix regular expression for parsing options ([645e331b](https://github.com/w11k/w11k-select/commit/645e331b3f8b03a52725f1a703c483ccc73cf096))


<a name="0.7.1"></a>
## 0.7.1 (2016-02-29)


### Bug Fixes

* **filter:** clears filter and update list on x-button click. ([ed4ad6ea](https://github.com/w11k/w11k-select/commit/ed4ad6ea9576153d688bf6afd358ca7edb08f474))
* **styling:** always shows the list of items. ([292ca4bf](https://github.com/w11k/w11k-select/commit/292ca4bf3c6351990970ff786016ec523ee6ff74))


<a name="0.7.0"></a>
## 0.7.0 (2016-02-03)


### Bug Fixes

* **ngModel:** don't set the view value without user interaction, set the model value to not mark field as dirty ([405df989](https://github.com/w11k/w11k-select/commit/405df989f53722abc4f9fd9f108abe3fb2e285a5))
* **dependency:** update w11kDropdownToggle to support newer angular versions via bower ([a13266cb](https://github.com/w11k/w11k-select/commit/a13266cbd6fed9f44bb585cb82ae6d7e012b3d1e))


### Features

* **checkboxes:** add config property 'hideCheckboxes' to hide checkboxes in single selection mode ([f84aa573](https://github.com/w11k/w11k-select/commit/f84aa5734b0eb709f357d12e7ceeb9813e538bf1), closes [#13](https://github.com/w11k/w11k-select/issues/13))
* **dropdown:** provide hooks for dropdown open and dropdown close events ([54ab1500](https://github.com/w11k/w11k-select/commit/54ab15002462db8d586f9fe6666a4b8dbbe2fa53), closes [#24](https://github.com/w11k/w11k-select/issues/24))
* **ngModel:** use validator pipeline for validation ([797aff02](https://github.com/w11k/w11k-select/commit/797aff0230c8c7ded0bb39514101e19826dac066))
* **select:** added config option to show the clearbutton ([67f0bcb4](https://github.com/w11k/w11k-select/commit/67f0bcb4991e7dffae5b1fee2c79430489c5bcb3))
* **service:**: extract hashCode, getParent and extendDeep to w11kSelectHelper service to make them testable and overridable ([973352d9](https://github.com/w11k/w11k-select/commit/973352d9b582c57efef439b9901492a05ba10134))
* **tabIndex:** make w11k-select accessible via keyboard with the tab key ([a3196bc4](https://github.com/w11k/w11k-select/commit/a3196bc4c74d986b47d8c058fc6b6db3f36ac540), closes [#19](https://github.com/w11k/w11k-select/issues/19))
* **trackBy:** add 'track by' part to w11kSelectOptions expression ([e7db96ea](https://github.com/w11k/w11k-select/commit/e7db96eac89b7067b54c9accaaf40e9fc07d918f), closes [#21](https://github.com/w11k/w11k-select/issues/21))


### Breaking Changes

* Using the 'new' validators pipeline requires AngularJS 1.3 or newer. bower.json was adjusted. With this release we drop support for AngularJS 1.2.
 ([797aff02](https://github.com/w11k/w11k-select/commit/797aff0230c8c7ded0bb39514101e19826dac066))


<a name="0.6.2"></a>
## 0.6.2 (2015-07-06)


### Bug Fixes

* **infinite-scroll:** rename directive to w11k-select-infinite-scroll to avoid name-conflicts ([4044bef0](https://github.com/w11k/w11k-select/commit/4044bef053bcd43ad58515b5bd334ac17c3c4916), closes [#20](https://github.com/w11k/w11k-select/issues/20))


<a name="0.6.1"></a>
## 0.6.1 (2015-01-26)


### Bug Fixes

* **track-by:** improve hash function used to calculate ng-repeat track-by value ([03cd453e](https://github.com/w11k/w11k-select/commit/03cd453ee873ab7ee3c4c99109d53c2f6d1bf4a7), closes [#17](https://github.com/w11k/w11k-select/issues/17))


<a name="0.6.0"></a>
## 0.6.0 (2014-11-11)


### Bug Fixes

* **bower:** update dependency to w11k-dropdownToggle ([ef1aeb4c](https://github.com/w11k/w11k-select/commit/ef1aeb4c9b7677106ab8622970fba8311be26632), closes [#14](https://github.com/w11k/w11k-select/issues/14))
* **filter:** select only one item in single selection mode ([8c928b97](https://github.com/w11k/w11k-select/commit/8c928b976f8a77b51d0b964ea069798cfa51075a), closes [#15](https://github.com/w11k/w11k-select/issues/15))


### Features

* **styling:** add LESS support ([4523b512](https://github.com/w11k/w11k-select/commit/4523b512cbff0a79e001ad02cd4b4e4f924d628a))


<a name="0.5.0"></a>
## 0.5.0 (2014-09-29)


### Features

* **bower:**
  * add support for ignoring files via 'ignore' ([200933b8](https://github.com/w11k/w11k-select/commit/200933b80920c42f40bab1c6ab1714bc272ad654))
  * add support for 'main' files ([e70f4f17](https://github.com/w11k/w11k-select/commit/e70f4f17d14cc24edd21468a56fb49475289a4ad))


<a name="0.4.7"></a>
## 0.4.7 (2014-07-21)


### Bug Fixes

* **select:** do not override ng-model with empty selection during initialisation ([585f8a40](https://github.com/w11k/w11k-select/commit/585f8a401f445d799e949f616da17d7635e41fcd), closes [#9](https://github.com/w11k/w11k-select/issues/9))


<a name="0.4.6"></a>
## 0.4.6 (2014-07-21)


### Bug Fixes

* **select:** do not override ng-model with empty selection on config change ([43d1b5a6](https://github.com/w11k/w11k-select/commit/43d1b5a6ea3b20e3d2ecd4cd7579e2ebde2b4f85), closes [#9](https://github.com/w11k/w11k-select/issues/9))


### Performance

* **options:** improve performance for updating options and change ng-model from outside 
  * use hash maps instead of lists and indexOf
  * use while loop instead of angular.forEach

<a name="0.4.5"></a>
## 0.4.5 (2014-07-07)


### Bug Fixes

* **options:** make checkbox click same like label click ([566f2b15](https://github.com/w11k/w11k-select/commit/566f2b1525ca6f6b52bf42bcaa0ef041c065e6cb))


<a name="0.4.4"></a>
## 0.4.4 (2014-06-10)


### Bug Fixes

* **options:**
  * mark options as selected on change of options even if options are objects ([609c0b4d](https://github.com/w11k/w11k-select/commit/609c0b4d4ca3f359e232032d690d3f4202e4ff2d), closes [#7](https://github.com/w11k/w11k-select/issues/7))
  * use watchCollection instead of simple watch to watch options ([02c2b97c](https://github.com/w11k/w11k-select/commit/02c2b97c031d51e45be5964a5a56f85657293239), closes [#6](https://github.com/w11k/w11k-select/issues/6))


<a name="0.4.3"></a>
## 0.4.3 (2014-06-04)


### Features

* **select:** improve styling of 'select all' and 'select none' buttons ([6c2a714e](https://github.com/w11k/w11k-select/commit/6c2a714e36f78d9189752b1a0d155e9df61bb1c2))
* **template:** include dependency to template module ([356cd817](https://github.com/w11k/w11k-select/commit/356cd817bcbe2334d8d52db5dd9e69d9b3cda786))


<a name="0.4.2"></a>
## 0.4.2 (2014-06-02)


### Bug Fixes

* **select:** fix updating header text with custom text ([c85102d3](https://github.com/w11k/w11k-select/commit/c85102d3d434e471f89e9a85884870f2354c68da))


<a name="0.4.1"></a>
## 0.4.1 (2014-06-02)


### Bug Fixes

* **adjust-height:** fix getting parent without 'w11k-select-adjust-height-to' container ([994c81e6](https://github.com/w11k/w11k-select/commit/994c81e6ee5c0edb50b584782557470bffcb2766))


<a name="0.4.0"></a>
## 0.4.0 (2014-06-02)


### Features

* **adjust-height:** improve adjust-height to support custom margin bottom and specifying container ([ef1bedc0](https://github.com/w11k/w11k-select/commit/ef1bedc07f5972ddd8b75a70e7c7961940ae05dc))
* **config:** make everything configurable via constant w11kSelectConfig and w11k-select-confi ([9f1dd673](https://github.com/w11k/w11k-select/commit/9f1dd673cc5b3af6d76446e846d600ded2cf894c))


### Breaking Changes

* Following attributes are no longer available:
  * w11k-select-multiple
  * w11k-select-selectedMassege
  * w11k-select-filter-placeholder
  * w11k-select-placeholder
  * w11k-select-disabled
  * w11k-select-required
  * w11k-select-style

  Use constant w11kSelectConfig and the new w11k-select-config attribute to configure the directive (see readme).

<a name="0.3.4"></a>
## 0.3.5 (2014-05-27)


### Bug Fixes

* **select:** prefix attributes with 'w11k-select' to make IE happy again ([cdb21df9](https://github.com/w11k/w11k-select/commit/cdb21df9559fbf003a312d90c341d6da6cd512b5))


### Breaking Changes

* All attributes used by 'w11k-select' directive has to be prefixed with 'w11k-select-' now.

Use

```
<div w11k-select
     w11k-select-multiple="true"
     w11k-select-disabled="disabled"
     w11k-select-options="option.value as option.label for option in options.data"
     w11k-select-placeholder="'All'"
     w11k-select-filter-placeholder="'Filter'"
     w11k-select-required="false"
     ng-model="selected.data"
     name="demoField"
     >
</div>
```

instead of

```
<div w11k-select
     multiple="true"
     disabled="disabled"
     options="option.value as option.label for option in options.data"
     placeholder="'All'"
     filter-placeholder="'Filter'"
     required="false"
     ng-model="selected.data"
     name="demoField"
     >
</div>
```


<a name="0.3.4"></a>
## 0.3.4 (2014-04-09)


### Bug Fixes

* **options:** do not identify options by index, otherwise changing options won't work ([0cb34def](https://github.com/w11k/w11k-select/commit/0cb34def4f357fe9b967b2f69a96dd2dd883ba64))


### Features

* **performance:** improve performance by not watching options deeply ([45428c6c](https://github.com/w11k/w11k-select/commit/45428c6c770c0ddee6b8e50a0b08f8ff613c471e))


<a name="0.3.3"></a>
## 0.3.3 (2014-04-08)


### Bug Fixes

* **IE8:** fix adjust height in IE8 ([60f9aedc](https://github.com/w11k/w11k-select/commit/60f9aedc4389ba40b6b4c09918e2a6782e0e78d7))
* **options:** set model value on change of options without making the form field dirty ([b2471961](https://github.com/w11k/w11k-select/commit/b247196189ce702fcc3b5c520325d87489b16efb))


<a name="0.3.2"></a>
## 0.3.2 (2014-03-30)

### Features

* **performance:** optimise amount of options added due to infinite scrolling, for smoother scrolling


<a name="0.3.1"></a>
## 0.3.1 (2014-03-30)


### Bug Fixes

* **filter:** call selectFiltered instead of selectAll on enter in filter input ([e48fc290](https://github.com/w11k/w11k-select/commit/e48fc2901fae4f984bbfa53b18e41f0470a6cb34))


<a name="0.3.0"></a>
## 0.3.0 (2014-03-30)


### Bug Fixes

* **directive:** fix memory leak on scope destroy ([ccb0affe](https://github.com/w11k/w11k-select/commit/ccb0affeaefdb8b9ec6413350c65751b0e616f80))


### Features

* **performance:** use infinite scrolling for more than 100 options
* **select:** close select box with 'esc' key ([e579af2d](https://github.com/w11k/w11k-select/commit/e579af2da8456022dcc9ba742727534680b27310))
* **styling:** make font-awesome optional via own css classes and make button texts customisabl ([772f4802](https://github.com/w11k/w11k-select/commit/772f48026cd027a0f4d42eb19f1ba81b3fd826f2))


<a name="0.2.0"></a>
## 0.2.0 (2014-03-28)


### Bug Fixes

* **buttons:** fix clear button, separate code for deselectAll and deselectFiltered ([46cd098e](https://github.com/w11k/w11k-select/commit/46cd098ee2d978df1d3b1ab0da190837d7c2e046))
* **styling:** change css base class from ww-select to w11k-select ([f95d746d](https://github.com/w11k/w11k-select/commit/f95d746d4246423103fd58f002bc4c5ac2c09de6))


### Features

* **dependencies:** eliminate dependency to jQuery ([759ce975](https://github.com/w11k/w11k-select/commit/759ce97594fd1b21be959224020d64929757767b))
* **performance:** render option list lazy (on first open of dropdown)([6283848](https://github.com/w11k/w11k-select/commit/628384802720c9bcde01dc087ae1524b3cf29b70))



<a name="0.1.1"></a>
## 0.1.1 (2014-03-05)


### Features

* **build:** include sass styling in dist ([292e6047](https://github.com/w11k/w11k-select/commit/292e604727ab11cd568766f0e6a3f350471a6928))


<a name="0.1.0"></a>
## 0.1.0 (2014-03-05)

### Features

* **options:** parse options given via attribute as ```"value" [as "label"] for "item" in "collection"```
* **ng-model:** use ngModelController to expose selected options and support validation
* **multiple:** support single- and multiple-select mode
* **disabled:** support disabled attribute to prevent change of selected options
* **placeholder:** support placeholder texts for dropdown header and filter box
* **template:** make template url configurable via config constant
* **selected-message:** support customisable text for toggle-area
