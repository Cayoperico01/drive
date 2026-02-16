import { formatCurrency, formatDate } from '../utils.js';
import { store } from '../store.js';
import { Toast } from '../toast.js';

export function Invoice(sale) {
    const emp = store.getEmployeeByIdSync(sale.employeeId);
    const empName = emp ? `${emp.first_name} ${emp.last_name}` : 'Inconnu';
    setTimeout(() => {
        const form = document.getElementById('invoice-edit-form');
        const root = document.getElementById('invoice-root');
        const printBtn = document.getElementById('btn-print-invoice');
        const pdfBtn = document.getElementById('btn-export-pdf');
        const saveBtn = document.getElementById('btn-save-invoice');
        const backBtn = document.getElementById('btn-back');
        function apply() {
            const clientName = document.getElementById('f-clientName').value.trim();
            const clientPhone = document.getElementById('f-clientPhone').value.trim();
            const vehicleModel = document.getElementById('f-vehicleModel').value.trim();
            const serviceType = document.getElementById('f-serviceType').value.trim();
            const price = parseFloat(document.getElementById('f-price').value) || 0;
            const companyName = document.getElementById('f-companyName').value.trim();
            const companyAddr = document.getElementById('f-companyAddr').value.trim();
            const note = document.getElementById('f-note').value.trim();
            document.getElementById('p-companyName').textContent = companyName || "DriveLine Customs";
            document.getElementById('p-companyAddr').textContent = companyAddr || "Atelier de mécanique • Los Santos";
            document.getElementById('p-clientName').textContent = clientName || '-';
            document.getElementById('p-clientPhone').textContent = clientPhone || '';
            document.getElementById('p-vehicleModel').textContent = vehicleModel || '';
            document.getElementById('p-serviceType').textContent = serviceType || '';
            document.getElementById('p-price').textContent = formatCurrency(price);
            document.getElementById('p-totalHT').textContent = formatCurrency(price);
            document.getElementById('p-totalTTC').textContent = formatCurrency(price);
            document.getElementById('p-note').textContent = note || '';
        }
        if (form) {
            form.addEventListener('submit', (e) => { e.preventDefault(); apply(); });
            form.querySelectorAll('input, textarea').forEach(inp => {
                inp.addEventListener('blur', apply);
                inp.addEventListener('input', () => {
                    // live enable
                    document.getElementById('btn-export-pdf').disabled = false;
                    document.getElementById('btn-save-invoice').disabled = false;
                });
            });
            apply();
        }
        if (printBtn) {
            printBtn.addEventListener('click', () => window.print());
        }
        if (backBtn) {
            backBtn.addEventListener('click', () => { 
                if (window.history.length > 1) {
                    window.history.back();
                } else {
                    window.location.hash = '#dashboard';
                }
            });
        }
        async function exportPdfBlob() {
            try {
                if (!window.html2canvas || !window.jspdf) {
                    Toast.show("Outils PDF manquants", "error");
                    return null;
                }
                const canvas = await window.html2canvas(root, { scale: 2, backgroundColor: '#ffffff' });
                const imgData = canvas.toDataURL('image/png');
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                const imgWidth = pageWidth;
                const imgHeight = canvas.height * imgWidth / canvas.width;
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                return pdf.output('blob');
            } catch (e) {
                Toast.show("Erreur export PDF: " + (e?.message || e), "error");
                return null;
            }
        }
        if (pdfBtn) {
            pdfBtn.addEventListener('click', async () => {
                const blob = await exportPdfBlob();
                if (!blob) return;
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `facture_${sale.id}.pdf`;
                a.click();
                setTimeout(() => URL.revokeObjectURL(url), 2000);
            });
        }
        if (saveBtn) {
            saveBtn.addEventListener('click', async () => {
                try {
                    saveBtn.disabled = true;
                    saveBtn.textContent = 'Enregistrement...';
                    const blob = await exportPdfBlob();
                    if (!blob) { saveBtn.disabled = false; saveBtn.textContent = 'Enregistrer dans Supabase'; return; }
                    const file = new File([blob], `facture_${sale.id}.pdf`, { type: 'application/pdf' });
                    const publicUrl = await store.uploadFile(file, 'invoices');
                    const updated = { ...sale, invoiceUrl: publicUrl };
                    await store.saveSale(updated);
                    Toast.show('Facture enregistrée !', 'success');
                    const currentUser = store.getCurrentUser();
                    const canViewAll = currentUser && store.hasPermissionSync(currentUser, 'sales.view_all');
                    window.location.hash = canViewAll ? '#admin-sales' : '#sales';
                } catch (e) {
                    Toast.show("Erreur enregistrement: " + (e?.message || e), 'error');
                } finally {
                    saveBtn.disabled = false;
                    saveBtn.textContent = 'Enregistrer dans Supabase';
                }
            });
        }
    }, 100);
    return `
        <div class="max-w-5xl mx-auto p-6">
            <div class="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-6 text-white">
                <form id="invoice-edit-form" class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label class="text-xs text-slate-400">Client</label>
                        <input id="f-clientName" class="w-full rounded-lg bg-slate-700 border border-slate-600 text-white p-2" value="${sale.clientName || ''}">
                        <input id="f-clientPhone" class="w-full mt-2 rounded-lg bg-slate-700 border border-slate-600 text-white p-2" placeholder="Téléphone" value="${sale.clientPhone || ''}">
                    </div>
                    <div>
                        <label class="text-xs text-slate-400">Véhicule</label>
                        <input id="f-vehicleModel" class="w-full rounded-lg bg-slate-700 border border-slate-600 text-white p-2" value="${sale.vehicleModel || ''}">
                        <label class="text-xs text-slate-400 mt-3 block">Prestation</label>
                        <input id="f-serviceType" class="w-full rounded-lg bg-slate-700 border border-slate-600 text-white p-2" value="${sale.serviceType || ''}">
                    </div>
                    <div>
                        <label class="text-xs text-slate-400">Prix</label>
                        <input id="f-price" type="number" step="0.01" class="w-full rounded-lg bg-slate-700 border border-slate-600 text-white p-2" value="${sale.price || 0}">
                        <label class="text-xs text-slate-400 mt-3 block">Note</label>
                        <textarea id="f-note" class="w-full rounded-lg bg-slate-700 border border-slate-600 text-white p-2" rows="2" placeholder="Notes sur la prestation"></textarea>
                    </div>
                    <div class="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        <div>
                            <label class="text-xs text-slate-400">Nom du Garage</label>
                            <input id="f-companyName" class="w-full rounded-lg bg-slate-700 border border-slate-600 text-white p-2" value="DriveLine Customs">
                        </div>
                        <div class="md:col-span-2">
                            <label class="text-xs text-slate-400">Adresse</label>
                            <input id="f-companyAddr" class="w-full rounded-lg bg-slate-700 border border-slate-600 text-white p-2" value="Atelier de mécanique • Los Santos">
                        </div>
                    </div>
                    <div class="md:col-span-3 flex gap-2 justify-end">
                        <button type="submit" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm">Appliquer</button>
                        <button type="button" id="btn-export-pdf" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm text-white">Télécharger PDF</button>
                        <button type="button" id="btn-save-invoice" class="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm text-white">Enregistrer dans Supabase</button>
                        <button type="button" id="btn-print-invoice" class="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-sm text-white">Imprimer</button>
                        <button type="button" id="btn-back" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm">Retour</button>
                    </div>
                </form>
            </div>
            <div id="invoice-root" class="bg-white text-slate-900 p-8 rounded-xl shadow-lg print:shadow-none print:mt-0">
            <div class="flex items-start justify-between mb-8">
                <div>
                    <h1 id="p-companyName" class="text-2xl font-bold">DriveLine Customs</h1>
                    <p id="p-companyAddr" class="text-sm text-slate-600">Atelier de mécanique • Los Santos</p>
                </div>
                <div class="text-right">
                    <h2 class="text-xl font-bold">Facture</h2>
                    <p class="text-sm text-slate-600">N° ${sale.id}</p>
                    <p class="text-sm text-slate-600">${formatDate(sale.date)}</p>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-6 mb-8">
                <div class="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <p class="text-xs font-semibold text-slate-500 uppercase">Client</p>
                    <p id="p-clientName" class="font-medium">${sale.clientName || '-'}</p>
                    <p id="p-clientPhone" class="text-sm text-slate-600">${sale.clientPhone || ''}</p>
                </div>
                <div class="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <p class="text-xs font-semibold text-slate-500 uppercase">Employé</p>
                    <p class="font-medium">${empName}</p>
                </div>
            </div>
            <table class="w-full text-sm border border-slate-200 rounded-lg overflow-hidden mb-8">
                <thead class="bg-slate-100">
                    <tr>
                        <th class="text-left p-3">Prestation</th>
                        <th class="text-left p-3">Véhicule</th>
                        <th class="text-right p-3">Prix</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="border-t border-slate-200">
                        <td id="p-serviceType" class="p-3">${sale.serviceType}</td>
                        <td id="p-vehicleModel" class="p-3">${sale.vehicleModel}</td>
                        <td id="p-price" class="p-3 text-right font-semibold">${formatCurrency(sale.price)}</td>
                    </tr>
                </tbody>
            </table>
            <div class="flex justify-end mb-8">
                <div class="w-64 bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <div class="flex justify-between">
                        <span class="text-slate-600">Total HT</span>
                        <span id="p-totalHT" class="font-medium">${formatCurrency(sale.price)}</span>
                    </div>
                    <div class="flex justify-between mt-2">
                        <span class="text-slate-600">TVA (0%)</span>
                        <span class="font-medium">${formatCurrency(0)}</span>
                    </div>
                    <div class="flex justify-between mt-2 border-t border-slate-200 pt-2">
                        <span class="font-bold">Total</span>
                        <span id="p-totalTTC" class="font-bold">${formatCurrency(sale.price)}</span>
                    </div>
                </div>
            </div>
            <div class="flex items-center justify-between">
                <p class="text-xs text-slate-500">Merci pour votre confiance.</p>
                <p id="p-note" class="text-xs text-slate-500"></p>
            </div>
            </div>
        </div>
    `;
}
