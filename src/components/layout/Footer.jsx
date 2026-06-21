import { APP_NAME, APP_TAGLINE } from '../../constants/config';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-400 text-center py-4 text-sm">
      <p className="font-semibold text-white">{APP_NAME}</p>
      <p>{APP_TAGLINE} &copy; {new Date().getFullYear()}</p>
    </footer>
  );
}
