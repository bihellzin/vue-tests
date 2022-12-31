import { mount } from '@vue/test-utils';
import axios from 'axios';
import { nextTick } from 'vue';
import ProductList from '.';
import { makeServer } from '@/miragejs/server';
import SearchBar from '@/components/SearchBar';
import ProductCard from '@/components/ProductCard';

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
    jest.clearAllMocks();
  });

  const getProducts = (quantity = 10, overrides = []) => {
    let overrideList = [];

    if (overrides.length > 0) {
      overrideList = overrides.map((override) =>
        server.create('product', override)
      );
    }
    const products = [
      ...server.createList('product', quantity),
      ...overrideList,
    ];

    return products;
  };

  const mountProductList = async (
    quantity = 10,
    overrides = [],
    shouldReject = false
  ) => {
    const products = getProducts(quantity, overrides);

    if (shouldReject) {
      axios.get.mockReturnValue(
        Promise.reject(new Error('some error message'))
      );
    } else {
      axios.get.mockReturnValue(Promise.resolve({ data: { products } }));
    }

    const wrapper = mount(ProductList, {
      mocks: {
        $axios: axios,
      },
    });

    await nextTick();

    return { wrapper, products };
  };

  it('should mount', async () => {
    const { wrapper } = await mountProductList();

    expect(wrapper.vm).toBeDefined();
  });

  it('should mount the SearchBar component as a child', async () => {
    const { wrapper } = await mountProductList();
    expect(wrapper.findComponent(SearchBar)).toBeDefined();
  });

  it('should call axios.get on component mount', async () => {
    await mountProductList();
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith('/api/products');
  });

  it('should mount the ProductCard component 10 times', async () => {
    const { wrapper } = await mountProductList();

    const cards = wrapper.findAllComponents(ProductCard);

    expect(cards).toHaveLength(10);
  });

  it('should display error message when Promise rejects', async () => {
    const { wrapper } = await mountProductList(10, [], true);

    expect(wrapper.text()).toContain('Problemas ao carregar a lista!');
  });

  it('should filter the product list when a search is performed', async () => {
    const { wrapper } = await mountProductList(10, [
      {
        title: 'Relogio da estacao',
      },
      {
        title: 'Relogio da moda',
      },
    ]);

    const search = wrapper.findComponent(SearchBar);
    search.find('input[type="search"]').setValue('Relogio');

    await search.find('form').trigger('submit');

    expect(wrapper.vm.searchTerm).toEqual('Relogio');
    expect(wrapper.findAllComponents(ProductCard)).toHaveLength(2);
  });

  it('should show all items when search is performed and searchTerm is blank', async () => {
    const { wrapper } = await mountProductList(10, [
      {
        title: 'Relogio da moda',
      },
    ]);

    const search = wrapper.findComponent(SearchBar);
    search.find('input[type="search"]').setValue('Relogio');

    await search.find('form').trigger('submit');

    search.find('input[type="search"]').setValue('');
    await search.find('form').trigger('submit');

    expect(wrapper.vm.searchTerm).toEqual('');
    expect(wrapper.findAllComponents(ProductCard)).toHaveLength(11);
  });
});
