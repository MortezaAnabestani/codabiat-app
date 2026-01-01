import { connectToDatabase, User } from '@codabiat/database';
import { hashPassword } from '@codabiat/auth';

async function createAdmin() {
  try {
    console.log('🔌 Connecting to database...');
    await connectToDatabase();

    const adminEmail = 'admin@codabiat.com';
    const adminPassword = 'admin123456'; // Change this!
    const adminName = 'مدیر سیستم';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Name:', existingAdmin.name);
      console.log('🔑 Role:', existingAdmin.role);
      return;
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await hashPassword(adminPassword);

    // Create admin user
    console.log('👤 Creating admin user...');
    const admin = await User.create({
      email: adminEmail,
      password: hashedPassword,
      name: adminName,
      role: 'admin',
      xp: 0,
      level: 1,
      badges: [],
      artworksCount: 0,
      followersCount: 0,
      followingCount: 0,
      following: [],
      preferences: {
        language: 'fa',
        notifications: true,
        profilePublic: true,
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', admin.email);
    console.log('👤 Name:', admin.name);
    console.log('🔑 Role:', admin.role);
    console.log('🆔 ID:', admin._id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 Password:', adminPassword);
    console.log('⚠️  Please change this password after first login!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
