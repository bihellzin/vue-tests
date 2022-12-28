import { mount } from '@vue/test-utils';
import axios from 'axios';
import { nextTick } from 'vue';
import ProductList from '.';
import ProductCard from '@/components/ProductCard';
import SearchBar from '@/components/SearchBar';
import { makeServer } from '@/miragejs/server';

jest.mock('axios', () => ({
  get: jest.fn(),
}));

describe('ProductList - integration', () => {
  let server;

  beforeEach(() => {
    server = makeServer({ environtment: 'test' });
  });

  afterEach(() => {
    server.shutdown();
  });

  it('should mount', () => {
    const wrapper = mount(ProductList);

    expect(wrapper.vm).toBeDefined();
  });

  it('should mount the SearchBar component as a child', () => {
    const wrapper = mount(ProductList);
    expect(wrapper.findComponent(SearchBar)).toBeDefined();
  });

  it('should call axios.get on component mount', () => {
    mount(ProductList, {
      mocks: {
        $axios: axios,
      },
    });
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith('/api/products');
  });

  it('should mount the ProductCard component 10 times', async () => {
    const products = server.createList('product', 10);
    axios.get.mockReturnValue(Promise.resolve({ data: { products } }));

    const wrapper = mount(ProductList, {
      mocks: {
        $axios: axios,
      },
    });

    await nextTick();

    const cards = wrapper.findAllComponents(ProductCard);

    expect(cards).toHaveLength(10);
  });

  it('should display error message when Promise rejects', async () => {
    axios.get.mockReturnValue(Promise.reject(new Error('some error message')));

    const wrapper = mount(ProductList, {
      mocks: {
        $axios: axios,
      },
    });

    await nextTick();

    expect(wrapper.text()).toContain('Problemas ao carregar a lista!');
  });

  it('should filter the product list when a search is performed', async () => {
    const products = [
      ...server.createList('product', 10),
      server.create('product', {
        title: 'Relogio da moda',
      }),
      server.create('product', {
        title: 'Relogio da estacao',
      }),
    ];

    axios.get.mockReturnValue(Promise.resolve({ data: { products } }));

    const wrapper = mount(ProductList, {
      mocks: {
        $axios: axios,
      },
    });

    await nextTick();

    const search = wrapper.findComponent(SearchBar);
    search.find('input[type="search"]').setValue('Relogio');

    await search.find('form').trigger('submit');

    expect(wrapper.vm.searchTerm).toEqual('Relogio');
    expect(wrapper.findAllComponents(ProductCard)).toHaveLength(2);
  });

  it('should show all items when search is performed and searchTerm is blank', async () => {
    const products = [
      ...server.createList('product', 10),
      server.create('product', {
        title: 'Relogio da moda',
      }),
    ];

    axios.get.mockReturnValue(Promise.resolve({ data: { products } }));

    const wrapper = mount(ProductList, {
      mocks: {
        $axios: axios,
      },
    });

    await nextTick();

    const search = wrapper.findComponent(SearchBar);
    search.find('input[type="search"]').setValue('Relogio');

    await search.find('form').trigger('submit');

    search.find('input[type="search"]').setValue('');
    await search.find('form').trigger('submit');

    expect(wrapper.vm.searchTerm).toEqual('');
    expect(wrapper.findAllComponents(ProductCard)).toHaveLength(11);
  });
});
