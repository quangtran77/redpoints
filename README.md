# Red Points - Ứng dụng chia sẻ điểm nguy hiểm trên đường

Ứng dụng web cho phép người lái xe chuyên nghiệp chia sẻ các địa điểm cần lưu ý trên đường như: điểm dễ xảy ra tai nạn, điểm dễ vi phạm luật, tình trạng đường, chốt cảnh sát, v.v.

## Tính năng

- Đăng nhập bằng tài khoản Google
- Chia sẻ địa điểm với hình ảnh và mô tả
- Chọn vị trí trên bản đồ
- Phân loại địa điểm (dễ tai nạn, vi phạm luật, tình trạng đường, chốt cảnh sát)
- Hệ thống điểm cho người dùng
- Phê duyệt báo cáo bởi moderator
- Chỉnh sửa báo cáo bị từ chối
- Xem danh sách báo cáo đã gửi
- Quản lý báo cáo cho moderator

## Yêu cầu hệ thống

- Node.js 18.x trở lên
- MongoDB
- Tài khoản Google Cloud Platform (cho OAuth)
- Tài khoản Mapbox (cho bản đồ)

## Cài đặt

1. Clone repository:
```bash
git clone https://github.com/yourusername/red-points.git
cd red-points
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file `.env` và cập nhật các biến môi trường:
```env
DATABASE_URL="mongodb+srv://your-username:your-password@your-cluster.mongodb.net/red-points?retryWrites=true&w=majority"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXT_PUBLIC_MAPBOX_TOKEN="your-mapbox-token"
```

4. Chạy migrations:
```bash
npx prisma generate
npx prisma db push
```

5. Chạy ứng dụng:
```bash
npm run dev
```

## Cấu trúc dự án

```
red-points/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── moderator/
│   │   │   └── reports/
│   │   ├── auth/
│   │   ├── moderator/
│   │   ├── profile/
│   │   └── reports/
│   ├── components/
│   ├── lib/
│   ├── types/
│   └── utils/
├── prisma/
│   └── schema.prisma
├── public/
└── package.json
```

## Công nghệ sử dụng

- Next.js 14
- TypeScript
- Tailwind CSS
- Prisma
- MongoDB
- NextAuth.js
- Mapbox GL JS
- React Map GL

## Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng tạo issue hoặc pull request.

## Giấy phép

MIT
