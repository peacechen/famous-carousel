export {Carousel} from './Carousel';
export {Arrow} from './Arrow';
export {Dots} from './Dots';
export {Pager} from './Pager';

import {Carousel} from './Carousel';
export default function(options) {
  return new Carousel(options);
}
