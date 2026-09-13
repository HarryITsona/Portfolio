// Initialize Lucide icons on load
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }
  initTheme();
  initCounters();
  initSignaturePad();
  initCodeTabs();
  initProjectFilter();
  initContactForm();
});

// Toast notification system
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'success' ? 'toast-success' : 'toast-info'}`;
  
  const icon = type === 'success' 
    ? '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
    : '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0176d3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
    
  toast.innerHTML = `${icon} <span>${message}</span>`;
  container.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 50);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Clipboard copy helper
function copyToClipboard(text, successMsg = 'Copied to clipboard!') {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMsg, 'success');
    }).catch(() => fallbackCopy(text, successMsg));
  } else {
    fallbackCopy(text, successMsg);
  }
}

function fallbackCopy(text, successMsg) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showToast(successMsg, 'success');
  } catch (err) {
    showToast('Failed to copy', 'info');
  }
  document.body.removeChild(textArea);
}

// Theme handling
function initTheme() {
  const savedTheme = localStorage.getItem('harish_portfolio_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
  
  const themeToggles = document.querySelectorAll('.theme-toggle');
  themeToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const target = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', target);
      localStorage.setItem('harish_portfolio_theme', target);
      updateThemeIcon(target);
      showToast(`Switched to ${target} mode`, 'info');
      
      // Update signature canvas stroke color for contrast
      const canvas = document.getElementById('signatureCanvas');
      if (canvas && window.sigCtx) {
        window.sigCtx.strokeStyle = target === 'dark' ? '#38bdf8' : '#0176d3';
      }
    });
  });
}

function updateThemeIcon(theme) {
  const sunIcons = document.querySelectorAll('.sun-icon');
  const moonIcons = document.querySelectorAll('.moon-icon');
  if (theme === 'light') {
    sunIcons.forEach(el => el.classList.add('hidden'));
    moonIcons.forEach(el => el.classList.remove('hidden'));
  } else {
    sunIcons.forEach(el => el.classList.remove('hidden'));
    moonIcons.forEach(el => el.classList.add('hidden'));
  }
}

// Counter animation
function initCounters() {
  const counters = document.querySelectorAll('.counter-val');
  let triggered = false;
  
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !triggered) {
      triggered = true;
      counters.forEach(counter => {
        const target = parseFloat(counter.getAttribute('data-target'));
        const isDecimal = counter.getAttribute('data-decimal') === 'true';
        const suffix = counter.getAttribute('data-suffix') || '';
        const duration = 1600;
        const steps = 40;
        const stepTime = duration / steps;
        let current = 0;
        
        const stepInc = target / steps;
        const timer = setInterval(() => {
          current += stepInc;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          counter.textContent = (isDecimal ? current.toFixed(2) : Math.floor(current)) + suffix;
        }, stepTime);
      });
    }
  }, { threshold: 0.2 });
  
  const statsSection = document.getElementById('stats-strip');
  if (statsSection) {
    observer.observe(statsSection);
  }
}

// Interactive Signature Pad Canvas
function initSignaturePad() {
  const canvas = document.getElementById('signatureCanvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  window.sigCtx = ctx;
  
  // Set resolution
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = 180;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    ctx.strokeStyle = isDark ? '#38bdf8' : '#0176d3';
  }
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  let isDrawing = false;
  let hasDrawn = false;
  
  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }
  
  function startDraw(e) {
    isDrawing = true;
    hasDrawn = true;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    e.preventDefault();
  }
  
  function moveDraw(e) {
    if (!isDrawing) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    e.preventDefault();
  }
  
  function stopDraw() {
    if (isDrawing) {
      ctx.closePath();
      isDrawing = false;
    }
  }
  
  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', moveDraw);
  canvas.addEventListener('mouseup', stopDraw);
  canvas.addEventListener('mouseleave', stopDraw);
  
  canvas.addEventListener('touchstart', startDraw, { passive: false });
  canvas.addEventListener('touchmove', moveDraw, { passive: false });
  canvas.addEventListener('touchend', stopDraw);
  
  // Clear button
  const clearBtn = document.getElementById('clearSignatureBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      hasDrawn = false;
      showToast('Canvas cleared', 'info');
    });
  }
  
  // Save button
  const saveBtn = document.getElementById('saveSignatureBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      if (!hasDrawn) {
        showToast('Please provide a signature on the canvas first!', 'info');
        return;
      }
      const dataUrl = canvas.toDataURL('image/png');
      const payloadSize = Math.round(dataUrl.length / 1024);
      showToast(`✅ Saved ${payloadSize}KB Base64 signature to ContentVersion linked to Record #REC-2026-88!`, 'success');
    });
  }
}

// Code showcase tabs
const codeSnippets = {
  agentforce: `// AgentforceInvoiceAction.cls - Agentforce Custom Action & Autonomous Logic
public with sharing class AgentforceInvoiceAction {
    
    public class ActionRequest {
        @InvocableVariable(label='Customer Account ID' required=true)
        public Id accountId;
        @InvocableVariable(label='Billing Cycle' required=false)
        public String billingCycle;
    }
    
    public class ActionResponse {
        @InvocableVariable(label='Summary Text')
        public String invoiceSummary;
        @InvocableVariable(label='Total Outstanding Amount')
        public Decimal totalAmount;
        @InvocableVariable(label='Generated PDF Document ID')
        public Id contentVersionId;
    }

    @InvocableMethod(
        label='Generate Customer Invoice Summary' 
        description='Called by Agentforce AI reasoning engine to autonomously summarize and create billing PDFs'
    )
    public static List<ActionResponse> executeInvoiceAction(List<ActionRequest> requests) {
        List<ActionResponse> responses = new List<ActionResponse>();
        for (ActionRequest req : requests) {
            ActionResponse res = new ActionResponse();
            List<Invoice__c> openInvoices = [
                SELECT Id, Amount__c, Status__c, Due_Date__c 
                FROM Invoice__c 
                WHERE Account__c = :req.accountId AND Status__c != 'Paid'
                WITH USER_MODE
            ];
            Decimal total = 0;
            for (Invoice__c inv : openInvoices) {
                total += inv.Amount__c;
            }
            res.totalAmount = total;
            res.invoiceSummary = 'Found ' + openInvoices.size() + ' open invoices totaling $' + total;
            responses.add(res);
        }
        return responses;
    }
}`,
  lwc: `// signatureCapturePad.js - Lightning Web Component
import { LightningElement, api, track } from 'lwc';
import saveSignatureDoc from '@salesforce/apex/SignatureController.saveSignature';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class SignatureCapturePad extends LightningElement {
    @api recordId;
    @track isSaving = false;
    canvasInitialized = false;
    canvas;
    ctx;

    renderedCallback() {
        if (this.canvasInitialized) return;
        this.canvasInitialized = true;
        this.canvas = this.template.querySelector('canvas.signature-canvas');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.ctx.lineWidth = 2.5;
            this.ctx.lineCap = 'round';
            this.ctx.strokeStyle = '#0176d3';
        }
    }

    async handleSave() {
        if (!this.canvas) return;
        this.isSaving = true;
        try {
            const dataUrl = this.canvas.toDataURL('image/png');
            const base64Data = dataUrl.split(',')[1];
            
            await saveSignatureDoc({
                parentId: this.recordId,
                fileName: 'Customer_Signature_' + Date.now() + '.png',
                base64Data: base64Data
            });

            this.dispatchEvent(new ShowToastEvent({
                title: 'Success',
                message: 'Signature attached to record files successfully!',
                variant: 'success'
            }));
        } catch (error) {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error Saving Signature',
                message: error.body ? error.body.message : error.message,
                variant: 'error'
            }));
        } finally {
            this.isSaving = false;
        }
    }
}`,
  aws: `// AWSSalesforceSyncService.cls - Real-time AWS Integration (Majenta Engagement)
public with sharing class AWSSalesforceSyncService {
    private static final String AWS_ENDPOINT = 'callout:AWS_Data_Sync_API';
    
    @future(callout=true)
    public static void syncRecordToAWS(Set<Id> recordIds) {
        List<Account> accounts = [
            SELECT Id, Name, Industry, AnnualRevenue, LastModifiedDate 
            FROM Account 
            WHERE Id IN :recordIds 
            WITH USER_MODE
        ];
        
        HttpRequest req = new HttpRequest();
        req.setEndpoint(AWS_ENDPOINT + '/v1/sync');
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json');
        req.setBody(JSON.serialize(accounts));
        req.setTimeout(120000);
        
        Http http = new Http();
        HttpResponse res = http.send(req);
        
        if (res.getStatusCode() != 200 && res.getStatusCode() != 201) {
            System.debug(LoggingLevel.ERROR, 'AWS Sync Failed: ' + res.getBody());
        }
    }
}`,
  byd: `// BYDAutomotiveBillingController.cls - BYD Automotive Cloud Invoicing
public with sharing class BYDAutomotiveBillingController {
    
    @AuraEnabled(cacheable=true)
    public static VehicleSalesSummary getVehicleSalesData(Id orderId) {
        Order ord = [
            SELECT Id, OrderNumber, Account.Name, TotalAmount, Status,
                   (SELECT Id, Product2.Name, Product2.ProductCode, UnitPrice, Quantity 
                    FROM OrderItems)
            FROM Order
            WHERE Id = :orderId
            WITH USER_MODE
            LIMIT 1
        ];
        return new VehicleSalesSummary(ord);
    }

    @AuraEnabled
    public static Id generateAutomotiveTaxInvoice(Id orderId) {
        PageReference pdfPage = Page.BYDAutomotiveInvoicePDF;
        pdfPage.getParameters().put('orderId', orderId);
        
        Blob pdfBlob = Test.isRunningTest() ? Blob.valueOf('BYD Test') : pdfPage.getContentAsPDF();
        
        ContentVersion cv = new ContentVersion();
        cv.Title = 'BYD_Invoice_' + orderId + '_' + Datetime.now().getTime();
        cv.PathOnClient = cv.Title + '.pdf';
        cv.VersionData = pdfBlob;
        cv.FirstPublishLocationId = orderId;
        insert cv;
        return cv.Id;
    }
}`,
  soql: `// Enterprise SOQL with Sub-queries, Aggregate & Relationship Traversals
SELECT 
    Id, 
    Name, 
    Industry, 
    Type, 
    Owner.Name, 
    Owner.Email,
    (
        SELECT Id, Subject, Priority, Status, CreatedDate 
        FROM Cases 
        WHERE IsClosed = false 
        ORDER BY CreatedDate DESC 
        LIMIT 5
    ),
    (
        SELECT Id, Name, StageName, Amount, CloseDate 
        FROM Opportunities 
        WHERE StageName NOT IN ('Closed Won', 'Closed Lost')
    )
FROM Account
WHERE AnnualRevenue > 1000000 
  AND HealthCloud_Member_Status__c = 'Active'
WITH USER_MODE
ORDER BY Name ASC
LIMIT 50`
};

function initCodeTabs() {
  const tabs = document.querySelectorAll('.code-tab-btn');
  const codeBlock = document.getElementById('active-code-block');
  const filenameLabel = document.getElementById('active-code-filename');
  const langBadge = document.getElementById('active-code-lang');
  
  if (!codeBlock) return;
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('bg-sf-blue', 'text-white', 'active');
        t.classList.add('text-slate-400', 'hover:text-white');
      });
      
      tab.classList.add('bg-sf-blue', 'text-white', 'active');
      tab.classList.remove('text-slate-400');
      
      const snippetKey = tab.getAttribute('data-snippet');
      const filename = tab.getAttribute('data-filename');
      const lang = tab.getAttribute('data-lang');
      
      if (codeSnippets[snippetKey]) {
        codeBlock.textContent = codeSnippets[snippetKey];
        if (filenameLabel) filenameLabel.textContent = filename;
        if (langBadge) langBadge.textContent = lang;
      }
    });
  });
  
  const copyBtn = document.getElementById('copyCodeBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      if (codeBlock) {
        copyToClipboard(codeBlock.textContent, 'Code copied to clipboard!');
      }
    });
  }
}

// Project category filter
function initProjectFilter() {
  const filterBtns = document.querySelectorAll('.project-filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('bg-sf-blue', 'text-white');
        b.classList.add('bg-slate-800/80', 'text-slate-300');
      });
      
      btn.classList.add('bg-sf-blue', 'text-white');
      btn.classList.remove('bg-slate-800/80', 'text-slate-300');
      
      const filter = btn.getAttribute('data-filter');
      
      projectCards.forEach(card => {
        const categories = card.getAttribute('data-category') || '';
        if (filter === 'all' || categories.includes(filter)) {
          card.style.display = 'flex';
          setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'translateY(0)'; }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => { card.style.display = 'none'; }, 200);
        }
      });
    });
  });
}

// Contact form simulation
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('form-name')?.value || '';
    const email = document.getElementById('form-email')?.value || '';
    const subject = document.getElementById('form-subject')?.value || 'Salesforce Developer Opportunity';
    const message = document.getElementById('form-message')?.value || '';
    
    const mailtoUrl = `mailto:harishb200218@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent("Hi Harish,\n\n" + message + "\n\nFrom: " + name + " (" + email + ")")}`;
    
    showToast('Opening your email client to reach Harish...', 'info');
    setTimeout(() => {
      window.location.href = mailtoUrl;
    }, 400);
  });
}

// Resume modal helpers
function openResumeModal() {
  const modal = document.getElementById('resumeModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }
}

function closeResumeModal() {
  const modal = document.getElementById('resumeModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
  }
}

// Mobile drawer toggle
function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  if (menu) {
    menu.classList.toggle('hidden');
  }
}
