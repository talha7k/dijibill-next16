import Image from "next/image";

const Footer = () => {
    return (
      <footer className="w-full text-center py-4 text-gray-600 flex items-center justify-center gap-2">
        <Image src="/logo.svg" alt="Dijitize.com" width={24} height={24} />
        &copy; 2025 Dijitize.com
      </footer>
    );
  };
  
  export default Footer;
  