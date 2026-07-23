import sys

with open('src/DashboardPages.tsx', 'r') as f:
    content = f.read()

# Fix the submit handler
old_submit = """      setShowAddModal(false);
      setMessage("✅ Channel created successfully.");
      setTimeout(() => {
        window.open(`https://${finalLink}`, '_blank');
        setMessage('');
      }, 1500);"""
new_submit = """      setShowAddModal(false);
      setShowSuccessModal(true);
      setTimeout(() => {
        window.open(`https://${finalLink}`, '_blank');
        setShowSuccessModal(false);
      }, 1500);"""
content = content.replace(old_submit, new_submit)

# Fix the modal content
old_modal = """            <div className="text-5xl mb-4">🙂</div>
            <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
            <p className="text-[#B8C0D0] mb-8">
              Your channel has been submitted successfully and is waiting for admin approval.
            </p>"""
new_modal = """            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-white mb-2">Success!</h3>
            <p className="text-[#B8C0D0] mb-8">
              Channel created successfully. Redirecting...
            </p>"""
content = content.replace(old_modal, new_modal)

with open('src/DashboardPages.tsx', 'w') as f:
    f.write(content)
