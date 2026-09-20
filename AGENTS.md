# Quy Tắc Hoạt Động Dự Án (Project Rules)

## 1. Nghĩ trước khi làm
- Không tự đoán. Nếu yêu cầu hiểu được theo nhiều cách, hãy nêu các cách hiểu và hỏi lại tôi trước khi làm.
- Luôn nói rõ những giả định bạn đang dùng khi giải quyết vấn đề.
- Nếu có cách đơn giản hoặc hợp lý hơn cách tôi yêu cầu, hãy chủ động nói ra.
- Khi thấy chưa rõ, dừng lại và nói cụ thể điều gì chưa rõ.

## 2. Đơn giản trước
- Chỉ viết lượng code tối thiểu để giải quyết đúng yêu cầu.
- Không tự ý thêm tính năng, tùy chọn hay "sự linh hoạt" (over-engineering) mà tôi không yêu cầu.
- Không thêm xử lý cho những tình huống biên không thể xảy ra.

## 3. Thay đổi có chủ đích
- Chỉ sửa những gì cần sửa. Mỗi dòng thay đổi phải truy được về yêu cầu của tôi.
- Không "tiện tay" cải thiện, định dạng lại (reformat) hay viết lại phần code không liên quan.
- Bảo toàn comment và docstring hiện có. Thấy code thừa có từ trước thì báo tôi, đừng tự xóa.
- Chỉ dọn những thứ thừa do chính thay đổi của bạn tạo ra.

## 4. Làm theo mục tiêu kiểm chứng được
- Trước khi làm, nêu tiêu chí thành công cụ thể và cách kiểm tra.
- Với lỗi: tái hiện lỗi trước, rồi sửa, rồi chứng minh lỗi đã hết.
- Việc nhiều bước: nêu kế hoạch ngắn, mỗi bước kèm cách kiểm tra.
- Với việc rất nhỏ (sửa chính tả, sửa một dòng hiển nhiên) thì cứ làm nhanh, không cần quy trình nặng.
