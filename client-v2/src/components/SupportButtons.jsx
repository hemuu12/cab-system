import { MessageCircle, Phone } from 'lucide-react';
import { motion } from 'motion/react';

export default function SupportButtons() {
  return <div className="support-buttons">
    <motion.a initial={{opacity:0,scale:.7}} animate={{opacity:1,scale:1}} whileHover={{scale:1.08,y:-2}} whileTap={{scale:.92}} transition={{type:'spring',stiffness:380,damping:24}} className="support whatsapp" href="https://wa.me/919675286699" target="_blank" rel="noreferrer" aria-label="WhatsApp support"><MessageCircle /></motion.a>
    <motion.a initial={{opacity:0,scale:.7}} animate={{opacity:1,scale:1}} whileHover={{scale:1.08,y:-2}} whileTap={{scale:.92}} transition={{type:'spring',stiffness:380,damping:24,delay:.08}} className="support phone" href="tel:+919876543210" aria-label="Call support"><Phone /></motion.a>
  </div>;
}
