type FooterProps = {
  stanVersion: string;
};

const Footer = ({ stanVersion }: FooterProps) => {
  return (
    <p className="footer">
      <span className="footer-left">{stanVersion}</span>
      <span className="footer-right">
        <a href="https://github.com/WardBrian/stan-web-demo">(source)</a>
      </span>
    </p>
  );
};

export default Footer;
