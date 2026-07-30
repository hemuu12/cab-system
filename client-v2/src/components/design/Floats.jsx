import { IconPhone, IconWhatsApp } from './icons.jsx';

export const SUPPORT_PHONE = '+919876543210';

/** Fixed WhatsApp / call buttons shared by both design pages. */
export default function Floats({ whatsappMessage, labelled = false }) {
  const openWhatsApp = () => window.open(`https://wa.me/919876543210?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
  return <div className="floats" aria-label="Contact WonderTravel">
    <button className="float wa" type="button" aria-label="Chat with WonderTravel on WhatsApp" onClick={openWhatsApp}>
      <IconWhatsApp />{labelled && <span>WhatsApp</span>}
    </button>
    <button className="float ph" type="button" aria-label="Call WonderTravel" onClick={() => { window.location.href = `tel:${SUPPORT_PHONE}`; }}>
      <IconPhone />{labelled && <span>Call us</span>}
    </button>
  </div>;
}
