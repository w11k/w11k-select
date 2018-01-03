import {InternalOption} from '../model/internal-option.model';
import {arrayExistsAndContains} from './array-exists-and-contains';

export const filterInternals = function (resourceList: InternalOption[], searchStr: string): InternalOption[] {
  return resourceList.map(it => {
    if (arrayExistsAndContains(it.children)) {
      it.children = filterInternals(it.children, searchStr);
    }
    it.isSearchResultOrParent = it.label.toString().toLowerCase().includes(searchStr) || ContainsResult(it.children);
    return it;
  });
};

function ContainsResult (resource: InternalOption[]): boolean {
  return resource.some(resource => resource.isSearchResultOrParent || ContainsResult(resource.children));
}
