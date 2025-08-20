import { useState, useRef, useEffect } from 'react';
import './ContactSection.scss';

interface ContactMethod {
  icon: string;
  label: string;
  value: string;
  action: () => void;
  color: string;
}

export function ContactSection() {
  const [hoveredMethod, setHoveredMethod] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const nodes: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
    }> = [];

    for (let i = 0; i < 30; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 3 + 2,
        color: ['#00ffff', '#ff00ff', '#ffff00'][Math.floor(Math.random() * 3)]
      });
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.globalAlpha = 0.6;
        ctx.fill();

        nodes.forEach(other => {
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = node.color;
            ctx.globalAlpha = 0.1 * (1 - distance / 120);
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      ctx.globalAlpha = 1;
      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  const contactMethods: ContactMethod[] = [
    {
      icon: '📧',
      label: 'Email',
      value: 'hello@thomasfriedrich.dev',
      action: () => window.open('mailto:hello@thomasfriedrich.dev'),
      color: '#00ffff'
    },
    {
      icon: '💼',
      label: 'LinkedIn',
      value: 'thomas-friedrich',
      action: () => window.open('https://linkedin.com/in/thomas-friedrich', '_blank'),
      color: '#ff00ff'
    },
    {
      icon: '🐙',
      label: 'GitHub',
      value: 'thomasfriedrich',
      action: () => window.open('https://github.com/thomasfriedrich', '_blank'),
      color: '#ffff00'
    },
    {
      icon: '📱',
      label: 'Phone',
      value: '+1 (555) 123-4567',
      action: () => window.open('tel:+15551234567'),
      color: '#00ff00'
    }
  ];

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setFormData({ name: '', email: '', message: '' });
    
    // Show success message (in a real app, handle actual submission)
    alert('Message sent successfully! I\'ll get back to you soon.');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="contact-container">
      <canvas ref={canvasRef} className="contact-background" />
      
      <div className="contact-header">
        <h2 className="contact-title">Let's Connect</h2>
        <p className="contact-subtitle">Ready to bring your ideas to life? Let's talk!</p>
      </div>

      <div className="contact-content">
        <div className="contact-methods">
          <h3 className="methods-title">Get In Touch</h3>
          <div className="methods-grid">
            {contactMethods.map((method) => (
              <div
                key={method.label}
                className={`contact-method ${hoveredMethod === method.label ? 'hovered' : ''}`}
                style={{ '--method-color': method.color } as React.CSSProperties}
                onMouseEnter={() => setHoveredMethod(method.label)}
                onMouseLeave={() => setHoveredMethod(null)}
                onClick={method.action}
              >
                <div className="method-icon">
                  <span>{method.icon}</span>
                  <div className="icon-ripple" />
                </div>
                <div className="method-info">
                  <div className="method-label">{method.label}</div>
                  <div className="method-value">{method.value}</div>
                </div>
                <div className="method-glow" />
              </div>
            ))}
          </div>

          <div className="quick-actions">
            <button className="action-btn schedule">
              <span className="btn-icon">📅</span>
              <span className="btn-text">Schedule a Call</span>
              <div className="btn-shine" />
            </button>
            <button className="action-btn download">
              <span className="btn-icon">📄</span>
              <span className="btn-text">Download Resume</span>
              <div className="btn-shine" />
            </button>
          </div>
        </div>

        <div className="contact-form-container">
          <h3 className="form-title">Send a Message</h3>
          <form className="contact-form" onSubmit={handleFormSubmit}>
            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="form-input"
              />
              <div className="input-glow" />
            </div>

            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="form-input"
              />
              <div className="input-glow" />
            </div>

            <div className="form-group">
              <textarea
                name="message"
                placeholder="Your Message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={5}
                className="form-textarea"
              />
              <div className="input-glow" />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`submit-btn ${isSubmitting ? 'submitting' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <div className="loading-spinner" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <span>Send Message</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </>
              )}
              <div className="btn-particles">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="particle" />
                ))}
              </div>
            </button>
          </form>
        </div>
      </div>

      <div className="contact-footer">
        <div className="footer-content">
          <p className="footer-text">
            "Great software is built through great collaboration. Let's create something amazing together!"
          </p>
          <div className="social-links">
            <a href="#" className="social-link twitter">🐦</a>
            <a href="#" className="social-link instagram">📸</a>
            <a href="#" className="social-link dribbble">🎨</a>
            <a href="#" className="social-link medium">✍️</a>
          </div>
        </div>
      </div>
    </div>
  );
}