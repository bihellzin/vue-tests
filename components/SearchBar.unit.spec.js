import { mount } from '@vue/test-utils';
import SearchBar from '@/components/SearchBar';

describe('SearchBar - unit', () => {
  it('should mount component', () => {
    const wrapper = mount(SearchBar);
    expect(wrapper).toBeDefined();
  });

  it('should emit search event when user press Enter', async () => {
    const wrapper = mount(SearchBar);
    const term = 'some text to search';

    await wrapper.find('input[type="search"]').setValue(term);
    await wrapper.find('form').trigger('submit');

    expect(wrapper.emitted().doSearch).toBeTruthy();
    expect(wrapper.emitted().doSearch.length).toBe(1);
    expect(wrapper.emitted().doSearch[0]).toEqual([{ term }]);
  });
});
