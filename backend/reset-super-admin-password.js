import { supabase } from "./db.js";
import bcrypt from "bcrypt";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function resetSuperAdminPassword() {
  try {
    console.log("🔧 Super Admin Password Reset Tool");
    console.log("=====================================");
    
    // Get current super admin info
    const { data: superAdmins, error: fetchError } = await supabase
      .from('super_admins')
      .select('id, username, email, full_name')
      .eq('is_active', true);

    if (fetchError || !superAdmins || superAdmins.length === 0) {
      console.error("❌ No active super admin found!");
      process.exit(1);
    }

    console.log("\n📋 Current Super Admins:");
    superAdmins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.full_name} (${admin.username}) - ${admin.email}`);
    });

    const adminIndex = await askQuestion("\nSelect admin number to reset password: ");
    const selectedAdmin = superAdmins[parseInt(adminIndex) - 1];

    if (!selectedAdmin) {
      console.error("❌ Invalid selection!");
      process.exit(1);
    }

    console.log(`\n🎯 Selected: ${selectedAdmin.full_name} (${selectedAdmin.username})`);
    
    const newPassword = await askQuestion("Enter new password (min 8 chars): ");
    
    if (newPassword.length < 8) {
      console.error("❌ Password must be at least 8 characters long!");
      process.exit(1);
    }

    const confirmPassword = await askQuestion("Confirm new password: ");
    
    if (newPassword !== confirmPassword) {
      console.error("❌ Passwords do not match!");
      process.exit(1);
    }

    // Hash the new password
    console.log("\n🔐 Hashing password...");
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update the password
    const { error: updateError } = await supabase
      .from('super_admins')
      .update({ 
        password_hash: passwordHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', selectedAdmin.id);

    if (updateError) {
      console.error("❌ Error updating password:", updateError);
      process.exit(1);
    }

    console.log("\n✅ Password reset successfully!");
    console.log("📋 New Credentials:");
    console.log(`   Username: ${selectedAdmin.username}`);
    console.log(`   Password: ${newPassword}`);
    console.log(`   Email: ${selectedAdmin.email}`);
    console.log("\n🔗 Login URL: http://localhost:5174/super-admin-login");
    console.log("\n⚠️  IMPORTANT: Keep these credentials secure!");

  } catch (err) {
    console.error("❌ Unexpected error:", err);
  } finally {
    rl.close();
  }
}

resetSuperAdminPassword();