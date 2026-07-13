const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-5 text-center text-sm text-slate-500">
      <div className="mx-auto max-w-7xl">
        <p>&copy; {new Date().getFullYear()} TLLCC Worship Scheduler. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
