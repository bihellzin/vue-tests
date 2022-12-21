import { mount } from '@vue/test-utils';
import ProductCard from '@/components/ProductCard';
import { makeServer } from '@/miragejs/server';

const mountProductCard = (server) => {
  const product = server.create('product', {
    title: 'Relogio novo',
    price: '45.00',
    image:
      'https://images.unsplash.com/photo-1495857000853-fe46c8aefc30?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=750&q=80',
  });

  return {
    wrapper: mount(ProductCard, {
      propsData: {
        product,
      },
    }),
    product,
  };
};

describe('Product Card - unit', () => {
  let server;

  beforeEach(() => {
    server = makeServer({ environtment: 'test' });
  });

  afterEach(() => {
    server.shutdown();
  });

  it('should match snapshot', () => {
    const { wrapper } = mountProductCard(server);

    expect(wrapper.element).toMatchSnapshot();
  });

  it('should mount', () => {
    const { wrapper } = mountProductCard(server);

    expect(wrapper.vm).toBeDefined();
    expect(wrapper.text()).toContain('Relogio novo');
    expect(wrapper.text()).toContain('45.00');
  });

  it('should emit the event addToCart with product object', async () => {
    const { wrapper, product } = mountProductCard(server);

    await wrapper.find('button').trigger('click');

    expect(wrapper.emitted().addToCart).toBeTruthy();
    expect(wrapper.emitted().addToCart.length).toBe(1);
    expect(wrapper.emitted().addToCart[0]).toEqual([{ product }]);
  });
});
