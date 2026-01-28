// Serenity Med Spa - Interactive Features

// Navigation
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
        
        const spans = hamburger.querySelectorAll('span');
        if (hamburger.classList.contains('active')) {
            spans[0].style.transform = 'rotate(-45deg) translate(-5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(45deg) translate(-5px, -5px)';
        } else {
            spans[0].style.transform = '';
            spans[1].style.opacity = '';
            spans[2].style.transform = '';
        }
    });
}

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 80;
            const position = target.offsetTop - offset;
            window.scrollTo({
                top: position,
                behavior: 'smooth'
            });
            // Close mobile menu
            if (navMenu) navMenu.classList.remove('active');
            if (hamburger) hamburger.classList.remove('active');
        }
    });
});

// Service tabs
const serviceTabs = document.querySelectorAll('.services-tab');
const servicePanels = document.querySelectorAll('.services-panel');

serviceTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const targetId = tab.dataset.tab;
        
        // Update tabs
        serviceTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update panels
        servicePanels.forEach(panel => {
            panel.classList.remove('active');
            if (panel.id === targetId) {
                panel.classList.add('active');
            }
        });
    });
});

// Sticky CTA bar
const stickyCta = document.getElementById('stickyCta');
const heroSection = document.querySelector('.hero');

if (stickyCta && heroSection) {
    const showStickyCta = () => {
        const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
        const scrollPosition = window.pageYOffset;
        
        if (scrollPosition > heroBottom - 200) {
            stickyCta.classList.add('visible');
        } else {
            stickyCta.classList.remove('visible');
        }
    };
    
    window.addEventListener('scroll', showStickyCta);
    showStickyCta(); // Check on load
}

// Chat functionality
const chatButton = document.getElementById('chatButton');
const chatWindow = document.getElementById('chatWindow');
const chatClose = document.getElementById('chatClose');
const chatSend = document.getElementById('chatSend');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');

if (chatButton) {
    chatButton.addEventListener('click', () => {
        chatWindow.classList.toggle('active');
        if (chatWindow.classList.contains('active') && chatInput) {
            chatInput.focus();
        }
    });
}

if (chatClose) {
    chatClose.addEventListener('click', () => {
        chatWindow.classList.remove('active');
    });
}

// Chat suggestions
document.querySelectorAll('.chat-suggestion[data-message]').forEach(btn => {
    btn.addEventListener('click', () => {
        const message = btn.dataset.message;
        if (message) {
            addMessage(message, true);
            setTimeout(() => {
                const response = getResponse(message);
                addMessage(response, false);
            }, 600);
        }
    });
});

function addMessage(text, isUser = false) {
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isUser ? 'user' : 'bot'}`;
    
    const messageP = document.createElement('p');
    messageP.textContent = text;
    messageDiv.appendChild(messageP);
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

const responses = {
    consultation: 'I\'d be happy to help you schedule a consultation. You can fill out the form on our contact page, or call us at (310) 555-0123. Would you like to use our Treatment Planning Tool first?',
    treatments: 'We offer Injectables (Botox, Fillers), Skin Rejuvenation (Peels, Microneedling, IPL), and Body & Wellness services. Our Treatment Planning Tool can help match you with the right services.',
    hours: 'We\'re open Monday through Friday, 9am to 7pm, and Saturday, 10am to 5pm.',
    location: 'We\'re located at 123 Luxury Boulevard, Suite 200, Beverly Hills, CA 90210.',
    default: 'Thank you for your message. For personalized treatment recommendations, try our Treatment Planning Tool — it takes just 2 minutes to get started.'
};

function getResponse(message) {
    const lower = message.toLowerCase();
    
    if (lower.includes('consult') || lower.includes('appointment') || lower.includes('book')) {
        return responses.consultation;
    }
    if (lower.includes('treatment') || lower.includes('service') || lower.includes('offer')) {
        return responses.treatments;
    }
    if (lower.includes('hour') || lower.includes('open') || lower.includes('time')) {
        return responses.hours;
    }
    if (lower.includes('where') || lower.includes('location') || lower.includes('address')) {
        return responses.location;
    }
    
    return responses.default;
}

if (chatSend && chatInput) {
    const sendMessage = () => {
        const message = chatInput.value.trim();
        if (message) {
            addMessage(message, true);
            chatInput.value = '';
            
            setTimeout(() => {
                const response = getResponse(message);
                addMessage(response, false);
            }, 600);
        }
    };
    
    chatSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}

// Form handling
const contactForm = document.getElementById('consultForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const firstName = contactForm.querySelector('input[placeholder="First Name"]')?.value;
        
        alert(`Thank you, ${firstName}. We've received your request and will be in touch within 24 hours.`);
        contactForm.reset();
    });
}

// Subtle scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.service-card, .testimonial-card, .expertise-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
});

// Icon style toggle (Press T to cycle through options)
const chatBtn = document.getElementById('chatButton');
const iconOptions = document.querySelectorAll('.icon-option');
const currentStyleDisplay = document.getElementById('currentStyle');
let currentIconStyle = 1;
const totalStyles = 6;

document.addEventListener('keydown', (e) => {
    if (e.key === 't' || e.key === 'T') {
        // Don't toggle if typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        currentIconStyle = currentIconStyle >= totalStyles ? 1 : currentIconStyle + 1;
        
        // Update active icon
        iconOptions.forEach((icon, index) => {
            icon.classList.remove('active');
            if (index + 1 === currentIconStyle) {
                icon.classList.add('active');
            }
        });
        
        // Update display
        if (currentStyleDisplay) {
            currentStyleDisplay.textContent = currentIconStyle;
        }
        
        // Update button data attribute
        if (chatBtn) {
            chatBtn.dataset.iconStyle = currentIconStyle;
        }
        
        // Log for reference
        const styleNames = [
            '',
            '1: Chat bubble + medical cross',
            '2: Stethoscope',
            '3: Heart + plus',
            '4: Chat bubble + Rx',
            '5: Circle + medical cross',
            '6: Person + plus (consultation)'
        ];
        console.log('Icon style:', styleNames[currentIconStyle]);
    }
});

// Label text options (can also toggle with L key)
const labelTexts = [
    'Ask a Specialist',
    'Medical Consultation',
    'Chat with Us',
    'Get Expert Advice',
    'Book Consultation'
];
let currentLabelIndex = 0;

document.addEventListener('keydown', (e) => {
    if (e.key === 'l' || e.key === 'L') {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        currentLabelIndex = (currentLabelIndex + 1) % labelTexts.length;
        const label = document.querySelector('.chat-label');
        if (label) {
            label.textContent = labelTexts[currentLabelIndex];
            console.log('Label text:', labelTexts[currentLabelIndex]);
        }
    }
});
