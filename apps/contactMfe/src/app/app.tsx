import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
// import emailjs from '@emailjs/browser';
import {
  FiMail as Mail,
  FiPhone as Phone,
  FiMapPin as MapPin,
  FiGithub as Github,
  FiLinkedin as Linkedin,
  FiTwitter as Twitter,
  FiSend as Send,
  FiUser as User,
  FiAtSign as AtSign,
  FiGlobe as Globe,
  FiCheck as Check,
  FiX as X,
  FiMessageSquare as MessageSquare
} from 'react-icons/fi';
import { HiSparkles as Sparkles } from 'react-icons/hi';
import styles from './app.module.scss';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface SocialLink {
  icon: React.ElementType;
  href: string;
  label: string;
  color: string;
}

export function App() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const formRef = useRef<HTMLFormElement>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormData>();

  useEffect(() => {
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const socialLinks: SocialLink[] = [
    { icon: Github, href: 'https://github.com', label: 'GitHub', color: '#333' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn', color: '#0077B5' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter', color: '#1DA1F2' },
  ];

  const contactInfo = [
    { icon: Mail, value: 'hello@example.com', label: 'Email' },
    { icon: Phone, value: '+1 (555) 123-4567', label: 'Phone' },
    { icon: MapPin, value: 'San Francisco, CA', label: 'Location' },
  ];

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      // Initialize EmailJS with your public key
      // emailjs.init('YOUR_PUBLIC_KEY');
      
      // Simulate email sending for demo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      /* Uncomment and configure for real email sending
      await emailjs.send(
        'YOUR_SERVICE_ID',
        'YOUR_TEMPLATE_ID',
        {
          from_name: data.name,
          from_email: data.email,
          subject: data.subject,
          message: data.message,
        }
      );
      */
      
      setSubmitStatus('success');
      reset();
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } catch (error) {
      console.error('Error sending email:', error);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Animated background gradient */}
      <div className={styles.backgroundGradient}>
        <div 
          className={styles.gradientOrb}
          style={{
            transform: `translate(${mousePosition.x * 0.05}px, ${mousePosition.y * 0.05}px)`
          }}
        />
      </div>

      {/* Floating particles */}
      <div className={styles.particlesContainer}>
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className={styles.particle}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              x: [0, (Math.random() - 0.5) * 100],
              y: [0, -100 - Math.random() * 100]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: 'easeOut'
            }}
          />
        ))}
      </div>

      <motion.div
        className={styles.content}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Header Section */}
        <motion.div
          className={styles.header}
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.div
            className={styles.iconWrapper}
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <MessageSquare size={40} />
            <Sparkles className={styles.sparkle} size={20} />
          </motion.div>
          <h1 className={styles.title}>Let's Connect</h1>
          <p className={styles.subtitle}>
            Have a project in mind? Let's create something amazing together.
          </p>
        </motion.div>

        <div className={styles.mainContent}>
          {/* Contact Information */}
          <motion.div
            className={styles.contactInfo}
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2>Get in Touch</h2>
            <div className={styles.infoCards}>
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  className={styles.infoCard}
                  whileHover={{ scale: 1.05, x: 10 }}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div className={styles.iconBox}>
                    <info.icon size={24} />
                  </div>
                  <div>
                    <p className={styles.label}>{info.label}</p>
                    <p className={styles.value}>{info.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Social Links */}
            <div className={styles.socialSection}>
              <h3>Follow Me</h3>
              <div className={styles.socialLinks}>
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                    style={{ '--social-color': social.color } as React.CSSProperties}
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                  >
                    <social.icon size={24} />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Decorative element */}
            <motion.div
              className={styles.decorativeElement}
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear'
              }}
            >
              <Globe size={200} strokeWidth={0.5} />
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            className={styles.formSection}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className={styles.form}>
              <div className={styles.formGroup}>
                <div className={styles.inputWrapper}>
                  <User className={styles.inputIcon} size={20} />
                  <input
                    {...register('name', { required: 'Name is required' })}
                    type="text"
                    placeholder="Your Name"
                    className={styles.input}
                  />
                </div>
                {errors.name && (
                  <motion.span
                    className={styles.error}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.name.message}
                  </motion.span>
                )}
              </div>

              <div className={styles.formGroup}>
                <div className={styles.inputWrapper}>
                  <AtSign className={styles.inputIcon} size={20} />
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    type="email"
                    placeholder="Your Email"
                    className={styles.input}
                  />
                </div>
                {errors.email && (
                  <motion.span
                    className={styles.error}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.email.message}
                  </motion.span>
                )}
              </div>

              <div className={styles.formGroup}>
                <div className={styles.inputWrapper}>
                  <Mail className={styles.inputIcon} size={20} />
                  <input
                    {...register('subject', { required: 'Subject is required' })}
                    type="text"
                    placeholder="Subject"
                    className={styles.input}
                  />
                </div>
                {errors.subject && (
                  <motion.span
                    className={styles.error}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.subject.message}
                  </motion.span>
                )}
              </div>

              <div className={styles.formGroup}>
                <div className={styles.textareaWrapper}>
                  <MessageSquare className={styles.inputIcon} size={20} />
                  <textarea
                    {...register('message', {
                      required: 'Message is required',
                      minLength: {
                        value: 10,
                        message: 'Message must be at least 10 characters'
                      }
                    })}
                    placeholder="Your Message"
                    rows={6}
                    className={styles.textarea}
                  />
                </div>
                {errors.message && (
                  <motion.span
                    className={styles.error}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.message.message}
                  </motion.span>
                )}
              </div>

              <motion.button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isSubmitting ? (
                  <motion.div
                    className={styles.loader}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                ) : (
                  <>
                    <Send size={20} />
                    Send Message
                  </>
                )}
              </motion.button>
            </form>

            {/* Status Messages */}
            <AnimatePresence>
              {submitStatus !== 'idle' && (
                <motion.div
                  className={`${styles.statusMessage} ${styles[submitStatus]}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {submitStatus === 'success' ? (
                    <>
                      <Check size={20} />
                      Message sent successfully!
                    </>
                  ) : (
                    <>
                      <X size={20} />
                      Failed to send message. Please try again.
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default App;