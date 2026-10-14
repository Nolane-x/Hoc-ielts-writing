const BANDS=[5,6,7,8,9];
const GUIDE={
 taskAchievement:{
 5:['Mới đáp ứng một phần yêu cầu; có thể bỏ sót điểm chính.','Overview còn mờ hoặc mục đích/thành phần thư chưa được triển khai đủ.','Đánh dấu từng yêu cầu và nối mỗi yêu cầu với câu trong bài.'],
 6:['Đã nêu ý chính nhưng việc chọn, so sánh hoặc mở rộng chưa đều.','Thông tin có thể được kể riêng lẻ hoặc thư còn thiếu chi tiết.','Viết overview/mục đích trước; chọn 2–3 điểm đáng so sánh nhất.'],
 7:['Đáp ứng rõ yêu cầu và chọn thông tin liên quan.','Một vài so sánh hoặc bullet point có thể cần phát triển thêm.','Kiểm tra mỗi điểm chính đã được giải thích hoặc so sánh chưa.'],
 8:['Chọn và phát triển điểm nổi bật rõ ràng, thích hợp và có kiểm soát.','Có thể còn một chỗ bỏ sót hoặc diễn đạt thiếu chính xác.','Loại bỏ chi tiết ít giá trị; dành chỗ cho điểm nổi bật.'],
 9:['Đáp ứng đầy đủ, chính xác và phù hợp mục đích.','Chỉ các sơ suất hiếm hoặc nhỏ mới còn đáng chú ý.','Giữ tính chọn lọc; không thêm dữ kiện ngoài đề.']},
 taskResponse:{
 5:['Trả lời đề một phần; lập trường và ý chính có thể chưa phát triển.','Có thể bỏ sót phần câu hỏi, lặp ý hoặc nêu claim không giải thích.','Viết checklist từ đề và đánh dấu nơi trả lời từng phần.'],
 6:['Có lập trường liên quan và trả lời phần lớn yêu cầu.','Ví dụ/lý do có thể chưa chứng minh trực tiếp cho luận điểm.','Với mỗi luận điểm, thêm câu giải thích và bằng chứng hỗ trợ.'],
 7:['Lập trường rõ; các phần đề được xử lý và ý chính được mở rộng.','Một vài bước lập luận có thể còn chung chung.','Hỏi sau mỗi đoạn: đoạn này trả lời phần nào và chứng minh điều gì?'],
 8:['Trả lời đầy đủ; lập trường nhất quán và ý được hỗ trợ phù hợp.','Một khía cạnh có thể ít sâu hoặc kết luận chưa được chứng minh.','Kiểm tra claim → reason → support → implication.'],
 9:['Lập trường được phát triển sâu, hợp lý và được hỗ trợ thuyết phục.','Tránh khẳng định quá mức hoặc lan man.','Tinh chỉnh độ chính xác và chiều sâu; giữ câu phục vụ lập luận.']},
 coherence:{
 5:['Tiến triển ý chưa ổn định; liên kết có thể lặp hoặc khó theo dõi.','Dùng từ nối thay cho logic; đoạn văn có thể gom nhiều ý.','Viết câu chức năng cho mỗi đoạn rồi xếp ý theo trật tự người đọc cần.'],
 6:['Tổ chức nhìn chung theo dõi được; liên kết đôi lúc máy móc.','Đoạn có thể đổi hướng hoặc dùng từ nối quá thường xuyên.','Kiểm tra tham chiếu và bỏ từ nối nếu quan hệ ý đã rõ.'],
 7:['Ý được sắp xếp logic; liên kết nhìn chung phù hợp.','Một vài chuyển tiếp hoặc tham chiếu chưa mượt.','Đọc câu đầu/cuối mỗi đoạn để rà mạch tiến triển.'],
 8:['Trình tự thông tin rõ, đoạn văn có mục đích, liên kết linh hoạt.','Vài chỗ dựa mẫu câu hoặc tham chiếu chưa cô đọng.','Thử bỏ từ nối và đánh giá xem logic có còn rõ.'],
 9:['Bài phát triển liền mạch; phân đoạn và tham chiếu tự nhiên.','Không đồng nhất trôi chảy với việc dùng nhiều từ nối.','Giữ cấu trúc rõ, tránh tối ưu hình thức quá mức.']},
 lexical:{
 5:['Vốn từ còn hạn chế; lặp hoặc chọn từ sai có thể gây khó hiểu.','Cụm từ dịch từng chữ từ tiếng Việt.','Học collocation cùng ví dụ, không chỉ từ đơn.'],
 6:['Từ vựng đủ dùng; đôi lúc lặp, thiếu tự nhiên hoặc sai kết hợp từ.','Cố dùng từ hiếm khi chưa chắc sắc thái.','Sửa collocation và độ chính xác trước khi tìm từ đồng nghĩa.'],
 7:['Từ vựng khá rộng và nhìn chung chính xác.','Một số từ/collocation vẫn có thể chưa tự nhiên.','Ghi cụm từ chính xác từ bản sửa rồi tự tạo ví dụ.'],
 8:['Từ vựng đa dạng, chính xác và linh hoạt.','Một vài lựa chọn từ có thể làm giảm độ tự nhiên.','So sánh cách nói và chọn cách rõ, đúng sắc thái.'],
 9:['Từ vựng phong phú, chính xác, phù hợp ngữ cảnh.','Không cần phô diễn từ hiếm; tự nhiên và chính xác quan trọng hơn.','Ưu tiên sắc thái và collocation đúng.']},
 grammar:{
 5:['Cấu trúc câu hạn chế; lỗi thường xuyên có thể cản trở hiểu.','Câu quá dài, thiếu chủ-vị hoặc dấu câu nhập nhằng.','Tách câu dài thành mệnh đề rõ rồi ghép lại có chủ đích.'],
 6:['Có câu đơn và phức; kiểm soát chưa đều nhưng phần lớn vẫn hiểu.','Lỗi chia động từ, mạo từ, số ít/số nhiều tái diễn.','Rà soát một nhóm lỗi mục tiêu thay vì sửa tất cả.'],
 7:['Cấu trúc linh hoạt; đa số câu được kiểm soát tốt.','Câu phức có thể tăng lỗi nếu không phục vụ ý nghĩa.','Kiểm tra chủ-vị, thì, mệnh đề và dấu câu trong câu phức nhất.'],
 8:['Phạm vi cấu trúc rộng, phần lớn chính xác.','Lỗi nhỏ trong mệnh đề/dấu câu có thể giảm tự nhiên.','Chỉnh độ chính xác trước khi đa dạng hóa cấu trúc.'],
 9:['Cấu trúc đa dạng và chính xác; lỗi rất hiếm.','Phức tạp không phải mục tiêu nếu câu khó đọc.','Giữ câu gọn, rõ, linh hoạt theo logic.']}
};
export function getRubricGuide(taskType='task2'){
 const type=['task1-academic','task1-general','task2'].includes(taskType)?taskType:'task2';
 const firstTitle=type==='task2'?'Task Response':'Task Achievement';
 const firstOverview=type==='task2'?'Đánh giá mức độ trả lời mọi phần của câu hỏi, độ rõ của lập trường và cách phát triển/hỗ trợ luận điểm.':type==='task1-general'?'Đánh giá mục đích bức thư, ba bullet point và văn phong phù hợp người nhận.':'Đánh giá lựa chọn, tóm tắt và so sánh thông tin nổi bật; overview và độ chính xác dữ liệu rất quan trọng.';
 const ids=['taskResponse','coherence','lexical','grammar'];
 const titles={taskResponse:firstTitle,coherence:'Coherence & Cohesion',lexical:'Lexical Resource',grammar:'Grammatical Range & Accuracy'};
 const overviews={taskResponse:firstOverview,coherence:'Trật tự ý, sự tiến triển logic, phân đoạn và cách liên kết/tham chiếu.',lexical:'Phạm vi từ vựng và độ chính xác, tự nhiên, phù hợp.',grammar:'Độ đa dạng cấu trúc cùng độ chính xác/kiểm soát ngữ pháp.'};
 return ids.map(id=>({id,title:titles[id],overview:overviews[id],bands:BANDS.map(score=>({score,signal:GUIDE[id==='taskResponse'?(type==='task2'?'taskResponse':'taskAchievement'):id][score][0],risk:GUIDE[id==='taskResponse'?(type==='task2'?'taskResponse':'taskAchievement'):id][score][1],practice:GUIDE[id==='taskResponse'?(type==='task2'?'taskResponse':'taskAchievement'):id][score][2]}))}));
}
