// [생성형 AI 활용] 모듈 불러오기
const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = process.env.PORT || 3000;

// [생성형 AI 활용] 데이터 처리 미들웨어 설정
app.use(express.urlencoded({ extended: true }));

// [생성형 AI 활용] 데이터베이스 연결 설정
const db = mysql.createConnection({
    host: 'mysql-3ff327c8-kjy04257407-4f5f.f.aivencloud.com',
    port: 26908,
    user: 'avnadmin',
    password: 'AVNS_vYg751HJWdvOYFGK6y6',
    database: 'restaurant_db',
    ssl: { rejectUnauthorized: false }
});

// [생성형 AI 활용] 연결 상태 확인
db.connect((err) => {
    if (err) {
        console.error('연결 실패:', err);
        return;
    }
    console.log('데이터베이스 연결 성공');
});

// [생성형 AI 활용] 메인 페이지
app.get('/', (req, res) => {
    const categorySql = `SELECT * FROM category`;
    const restaurantSql = `
        SELECT r.id, r.name AS restaurant_name, c.name AS category_name, r.rating, r.review
        FROM restaurant r
        JOIN category c ON r.category_id = c.id
        ORDER BY r.id DESC
    `;

    db.query(categorySql, (err, categories) => {
        if (err) return res.status(500).send('카테고리 조회 에러');

        db.query(restaurantSql, (err, restaurants) => {
            if (err) return res.status(500).send('식당 목록 조회 에러');

            let categoryOptions = categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

            let tableRows = restaurants.map(item => `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.category_name}</td>
                    <td>${item.restaurant_name}</td>
                    <td>★ ${item.rating}</td>
                    <td>${item.review}</td>
                </tr>
            `).join('');

            let html = `
                <!DOCTYPE html>
                <html lang="ko">
                <head>
                    <meta charset="UTF-8">
                    <title>20107 김진영 맛집 정보 서버</title>
                    <style>
                        body { font-family: sans-serif; margin: 30px; }
                        h1, h3 { color: #333; }
                        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                        th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
                        th { background-color: #f4f4f4; }
                        .form-box { background: #f9f9f9; padding: 15px; border: 1px solid #ddd; margin-bottom: 20px; border-radius: 5px; }
                        .form-group { margin-bottom: 10px; }
                        label { display: block; font-weight: bold; margin-bottom: 5px; }
                        input, select, textarea { width: 100%; padding: 8px; box-sizing: border-box; }
                        button { padding: 10px 15px; background: #333; color: white; border: none; cursor: pointer; border-radius: 3px; }
                        button:hover { background: #555; }
                    </style>
                </head>
                <body>
                    <h1>맛집 목록</h1>

                    <div class="form-box">
                        <h3>맛집 추가</h3>
                        <form action="/add" method="POST">
                            <div class="form-group">
                                <label>카테고리</label>
                                <select name="category_id" required>
                                    ${categoryOptions}
                                </select>
                            </div>
                            <div class="form-group">
                                <label>식당 이름</label>
                                <input type="text" name="name" required>
                            </div>
                            <div class="form-group">
                                <label>평점 (1부터 5까지)</label>
                                <input type="number" name="rating" min="1" max="5" value="5" required>
                            </div>
                            <div class="form-group">
                                <label>리뷰</label>
                                <textarea name="review" rows="2" required></textarea>
                            </div>
                            <button type="submit">등록</button>
                        </form>
                    </div>

                    <h3>등록된 맛집</h3>
                    <table>
                        <tr>
                            <th>번호</th>
                            <th>카테고리</th>
                            <th>식당 이름</th>
                            <th>평점</th>
                            <th>리뷰</th>
                        </tr>
                        ${tableRows}
                    </table>
                </body>
                </html>
            `;

            res.send(html);
        });
    });
});

// [생성형 AI 활용] 맛집 추가 기능
app.post('/add', (req, res) => {
    const { category_id, name, rating, review } = req.body;
    const sql = `INSERT INTO restaurant (category_id, name, rating, review) VALUES (?, ?, ?, ?)`;

    db.query(sql, [category_id, name, rating, review], (err, result) => {
        if (err) {
            console.error('데이터 추가 실패:', err);
            res.status(500).send('데이터 추가 실패');
            return;
        }
        res.redirect('/');
    });
});

// [생성형 AI 활용] 서버 실행
app.listen(port, () => {
    console.log(`서버 실행 완료`);
});