import sprite from '@assets/coin-sprite.svg?raw';

const SpriteDefs = () => (
  <div style={{ display: 'none' }} dangerouslySetInnerHTML={{ __html: sprite }} />
);

export default SpriteDefs;
