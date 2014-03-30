<a name="0.3.1"></a>
## 0.3.1 (2014-03-30)


### Bug Fixes

* **filter:** call selectFiltered instead of selectAll on enter in filter input ([e48fc290](https://github.com/pburgmer/w11k-select/commit/e48fc2901fae4f984bbfa53b18e41f0470a6cb34))


<a name="0.3.0"></a>
## 0.3.0 (2014-03-30)


### Bug Fixes

* **directive:** fix memory leak on scope destroy ([ccb0affe](https://github.com/pburgmer/w11k-select/commit/ccb0affeaefdb8b9ec6413350c65751b0e616f80))


### Features

* **performance:** use infinite scrolling for more than 100 options
* **select:** close select box with 'esc' key ([e579af2d](https://github.com/pburgmer/w11k-select/commit/e579af2da8456022dcc9ba742727534680b27310))
* **styling:** make font-awesome optional via own css classes and make button texts customisabl ([772f4802](https://github.com/pburgmer/w11k-select/commit/772f48026cd027a0f4d42eb19f1ba81b3fd826f2))


<a name="0.2.0"></a>
## 0.2.0 (2014-03-28)


### Bug Fixes

* **buttons:** fix clear button, separate code for deselectAll and deselectFiltered ([46cd098e](https://github.com/pburgmer/w11k-select/commit/46cd098ee2d978df1d3b1ab0da190837d7c2e046))
* **styling:** change css base class from ww-select to w11k-select ([f95d746d](https://github.com/pburgmer/w11k-select/commit/f95d746d4246423103fd58f002bc4c5ac2c09de6))


### Features

* **dependencies:** eliminate dependency to jQuery ([759ce975](https://github.com/pburgmer/w11k-select/commit/759ce97594fd1b21be959224020d64929757767b))
* **performance:** render option list lazy (on first open of dropdown)([6283848](https://github.com/pburgmer/w11k-select/commit/628384802720c9bcde01dc087ae1524b3cf29b70))



<a name="0.1.1"></a>
## 0.1.1 (2014-03-05)


### Features

* **build:** include sass styling in dist ([292e6047](https://github.com/pburgmer/w11k-select/commit/292e604727ab11cd568766f0e6a3f350471a6928))


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
