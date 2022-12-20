import { mount } from '@vue/test-utils';
import ProductCard from '@/components/ProductCard';

describe('Product Card - unit', () => {
  it('should mount', () => {
    const wrapper = mount(ProductCard, {
      propsData: {
        product: {},
      },
    });
    expect(wrapper.vm).toBeDefined();
  });
});
