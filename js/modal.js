export const Modal = {
    init() {
        if (!document.getElementById('modal-container')) {
            const container = document.createElement('div');
            container.id = 'modal-container';
            container.className = 'fixed inset-0 z-[60] hidden flex items-center justify-center';
            container.innerHTML = `
                <div class="absolute inset-0 bg-black/60 transition-opacity" id="modal-backdrop"></div>
                <div id="modal-content" class="relative bg-slate-900/80 glass rounded-2xl border border-slate-700 shadow-2xl w-full max-w-md p-6 transform transition-all duration-150 scale-95 opacity-0 max-h-[90vh] overflow-y-auto">
                    <!-- Dynamic Content -->
                </div>
            `;
            document.body.appendChild(container);
        }
    },

    show({ title, message, type = 'info', confirmText = 'Confirmer', cancelText = 'Annuler', onConfirm, inputExpected = null, size = 'md' }) {
        this.init();
        const container = document.getElementById('modal-container');
        const content = document.getElementById('modal-content');
        const backdrop = document.getElementById('modal-backdrop');

        // Update width based on size
        content.classList.remove('max-w-md', 'max-w-lg', 'max-w-xl', 'max-w-2xl', 'max-w-3xl');
        content.classList.add(`max-w-${size}`);

        // Reset classes for animation
        container.classList.remove('hidden');
        // Small delay to allow display:block to apply before opacity transition
        requestAnimationFrame(() => {
            content.classList.remove('scale-95', 'opacity-0');
            content.classList.add('scale-100', 'opacity-100');
        });

        // Icon based on type
        let iconHtml = '';
        if (type === 'danger') {
            iconHtml = `<div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-900/20 sm:mx-0 sm:h-10 sm:w-10">
                <i data-lucide="alert-triangle" class="h-6 w-6 text-red-500"></i>
            </div>`;
        } else {
            iconHtml = `<div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-900/20 sm:mx-0 sm:h-10 sm:w-10">
                <i data-lucide="info" class="h-6 w-6 text-blue-500"></i>
            </div>`;
        }

        // Input field if needed
        let inputHtml = '';
        if (inputExpected) {
            inputHtml = `
                <div class="mt-4">
                    <label class="block text-sm font-medium text-slate-400 mb-1">Tapez <span class="font-bold text-white select-all">${inputExpected}</span> pour confirmer :</label>
                    <input type="text" id="modal-input" class="block w-full rounded-lg border-slate-600 bg-slate-900 text-white placeholder-slate-500 focus:border-red-500 focus:ring-red-500 sm:text-sm p-2.5" autocomplete="off">
                </div>
            `;
        }

        content.innerHTML = `
            <div class="h-1 w-full rounded-full bg-gradient-to-r from-[#dd3bcc] via-[#4bb4d3] to-[#dd3bcc] mb-5"></div>
            <div class="flex items-start gap-3 mb-3">
                ${iconHtml}
                <div class="flex-1 min-w-0">
                    <h3 class="text-lg font-semibold leading-6 text-white" id="modal-title">${title}</h3>
                </div>
                <button id="modal-close-icon" class="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                    <i data-lucide="x" class="w-4 h-4"></i>
                </button>
            </div>
            <div id="modal-body" class="text-sm text-slate-300">
                ${message}
            </div>
            ${inputHtml}
            <div class="mt-6 flex justify-end gap-2">
                ${cancelText ? `
                <button type="button" id="modal-cancel-btn" class="inline-flex justify-center rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-slate-700 hover:bg-slate-700 transition-colors">
                    ${cancelText}
                </button>
                ` : ''}
                <button type="button" id="modal-confirm-btn" class="inline-flex justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm ${type === 'danger' ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-700'} disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    ${confirmText}
                </button>
            </div>
        `;

        if (window.lucide) lucide.createIcons();

        const confirmBtn = document.getElementById('modal-confirm-btn');
        const cancelBtn = document.getElementById('modal-cancel-btn');
        const input = document.getElementById('modal-input');

        // Logic for input validation
        if (inputExpected && input) {
            confirmBtn.disabled = true;
            input.addEventListener('input', (e) => {
                if (e.target.value === inputExpected) {
                    confirmBtn.disabled = false;
                } else {
                    confirmBtn.disabled = true;
                }
            });
            input.focus();
        } else {
            confirmBtn.focus();
        }

        const close = () => {
            content.classList.remove('scale-100', 'opacity-100');
            content.classList.add('scale-95', 'opacity-0');
            setTimeout(() => {
                container.classList.add('hidden');
            }, 200); // Match transition duration
        };

        confirmBtn.onclick = async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onConfirm) {
                const result = onConfirm();
                if (result instanceof Promise) {
                    const originalText = confirmBtn.innerText;
                    confirmBtn.disabled = true;
                    confirmBtn.innerHTML = '<div class="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>';
                    try {
                        await result;
                    } catch (err) {
                        console.error(err);
                    } finally {
                        confirmBtn.disabled = false;
                        confirmBtn.innerText = originalText;
                    }
                }
            }
            close();
        };

        const closeIcon = document.getElementById('modal-close-icon');
        if (cancelBtn) cancelBtn.onclick = close;
        if (closeIcon) closeIcon.onclick = close;
        backdrop.onclick = close; // Click outside to close
    }
};
