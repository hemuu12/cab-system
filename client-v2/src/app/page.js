import { readDesignCss } from '../lib/readDesignCss.js';
import HomeClient from '../components/home/HomeClient.jsx';

export default function Home() {
  const homeCss = readDesignCss('styles/home.css');
  return <HomeClient homeCss={homeCss} />;
}
