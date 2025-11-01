import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import logo from '@assets/logo-coinoWin.svg';

const Sidebar = () => {
  const { t } = useTranslation();

  const links = [
    { to: '/markets', label: t('markets') },
    { to: '/spot', label: t('spot') },
    { to: '/wallet', label: t('wallet') },
    { to: '/orders', label: t('orders') },
    { to: '/settings', label: t('settings') },
    { to: '/support', label: t('support') }
  ];

  return (
    <aside className="sidebar">
      <div className="logo">
        <img src={logo} alt="CoinoWin" width={32} height={32} />
        <span>CoinoWin</span>
      </div>
      <nav>
        {links.map(link => (
          <NavLink key={link.to} to={link.to} className={({ isActive }) => (isActive ? 'active' : '')}>
            <motion.span whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
              {link.label}
            </motion.span>
          </NavLink>
        ))}
      </nav>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="status-banner"
      >
        {t('networkNotice')}
      </motion.div>
    </aside>
  );
};

export default Sidebar;
