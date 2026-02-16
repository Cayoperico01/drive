export const Toast = {
    init() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed top-4 right-4 z-50 flex flex-col gap-3';
        document.body.appendChild(container);
    },

    show(message, type = 'success', duration = 3000) {
        const container = document.getElementById('toast-container');
        if (!container) this.init();

        const cssVar = (name, fallback) => {
            try {
                const v = getComputedStyle(document.documentElement).getPropertyValue(name);
                return (v && String(v).trim()) ? String(v).trim() : fallback;
            } catch (e) {
                return fallback;
            }
        };

        const toast = document.createElement('div');
        const hexToRgba = (hex, alpha) => {
            const h = hex.replace('#','');
            const r = parseInt(h.substring(0,2),16);
            const g = parseInt(h.substring(2,4),16);
            const b = parseInt(h.substring(4,6),16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };
        let accent = cssVar('--brand-blue', '#4bb4d3');
        let icon = `<i data-lucide="check-circle" class="w-5 h-5" style="color:${accent}"></i>`;
        if (type === 'error') {
            accent = '#ef4444';
            icon = `<i data-lucide="alert-circle" class="w-5 h-5" style="color:${accent}"></i>`;
        } else if (type === 'info') {
            accent = cssVar('--brand-blue', '#4bb4d3');
            icon = `<i data-lucide="info" class="w-5 h-5" style="color:${accent}"></i>`;
        } else if (type === 'warning') {
            accent = '#f59e0b';
            icon = `<i data-lucide="alert-triangle" class="w-5 h-5" style="color:${accent}"></i>`;
        }

        toast.className = `relative overflow-hidden rounded-xl shadow-lg px-4 py-3 min-w-[320px] backdrop-blur-sm border transform transition-all duration-300 translate-x-full opacity-0 flex items-center gap-3`;
        toast.style.borderColor = hexToRgba(accent, 0.35);
        toast.style.background = cssVar('--surface-1', 'rgba(11, 17, 28, 0.86)');
        toast.style.color = '#fff';
        const bar = document.createElement('span');
        bar.className = 'absolute left-0 top-0 h-full';
        bar.style.width = '4px';
        bar.style.background = `linear-gradient(180deg, ${cssVar('--brand-pink', '#dd3bcc')}, ${cssVar('--brand-blue', '#4bb4d3')})`;
        const shine = document.createElement('span');
        shine.className = 'absolute inset-0 pointer-events-none';
        shine.style.background = `radial-gradient(600px 240px at 20% 0%, ${hexToRgba(cssVar('--brand-pink', '#dd3bcc'), 0.18)} 0%, transparent 60%), radial-gradient(600px 240px at 85% 0%, ${hexToRgba(cssVar('--brand-blue', '#4bb4d3'), 0.18)} 0%, transparent 60%)`;
        toast.innerHTML = `
            ${icon}
            <span class="font-medium text-sm">${message}</span>
        `;
        toast.prepend(bar);
        toast.appendChild(shine);

        document.getElementById('toast-container').appendChild(toast);
        
        // Refresh icons
        if(window.lucide) lucide.createIcons();

        // Animate In
        requestAnimationFrame(() => {
            toast.classList.remove('translate-x-full', 'opacity-0');
        });

        // Animate Out & Remove
        setTimeout(() => {
            toast.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, duration);
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => Toast.init());

// Expose globally for inline events
window.Toast = Toast;
