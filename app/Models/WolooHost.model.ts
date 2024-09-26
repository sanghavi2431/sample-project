import BaseModel from "./BaseModel";

export class WolooHostModel extends BaseModel {
  constructor() {
    super();
  }

  async wolooLike(userId: any, wolooId: any, like: number) {
    return await this._executeQuery(
      `UPDATE woloo_engagements
      SET is_active = ?, engagement_type="like"
      WHERE user_id=? and  woloo_id=?`,
      [like, userId, wolooId]
    );
  }
  async isWolooExist(wolooId: any) {
    return await this._executeQuery(
      `select id from woloos where id=?`,
      [wolooId]
    );
  }

  async getWolooId(code: any) {
    return await this._executeQuery(
      `select id from woloos where code =?`,
      [code]
    );
  }

async UserWolooRatingCount(wolooId: any, status: number) {
    return await this._executeQuery(
      `SELECT COUNT(*) AS reviewCount 
    FROM user_woloo_ratings 
    WHERE  woloo_id=? AND status = 1
    `,
      [wolooId, status]
    );
  }

  async UserWolooRating(wolooId: any, status: number) {
    return await this._executeQuery(
      `SELECT rating FROM user_woloo_ratings where woloo_id=? and status=1`,
      [wolooId, status]
    );
  }

  async CreatewolooLike(userId: any, wolooId: any, like: number) {
    return await this._executeQuery(
      `INSERT INTO woloo_engagements (user_id, woloo_id, is_active)
        VALUES (?, ?, ?)`,
      [userId, wolooId, like]
    );
  }

  async wolooEngagementCount(wolooId: any) {
    return await this._executeQuery(
      `SELECT engagement_type, count(*) as total FROM woloo_engagements where woloo_id=? and is_active=1 group by engagement_type`,
      [wolooId]
    );
  }

  async wolooRewardHistory(userId: any, limit: number, pageNumber: number) {
    return await this._executeQuery(
      `SELECT
      w.id,
      w.woloo_id ,
      w.user_id as user_id ,w.amount ,
      w.type,
       w.is_review_pending ,
      w.created_at ,
      w.updated_at,
      wo.id as woloo_id ,
      wo.code ,
      wo.name ,
      wo.title ,
      wo.image ,
      wo.opening_hours ,
      wo.restaurant ,
      wo.restaurant ,
      wo.segregated ,
      wo.address ,
      wo.address ,
      wo.city ,
      wo.lat ,
      wo.lng ,
      wo.status ,
      wo.user_id as woloo_user_id,
        wo.description ,
      wo.created_at ,
      wo.updated_at ,
      wo.deleted_at ,
      wo.is_covid_free ,
      wo.is_safe_space ,
      wo.is_clean_and_hygiene ,
      wo.is_sanitary_pads_available ,
      wo.is_makeup_room_available ,
      wo.is_coffee_available ,
      wo.is_sanitizer_available ,
      wo.is_feeding_room ,
      wo.is_wheelchair_accessible ,
      wo.is_washroom ,
      wo.is_premium ,
      wo.is_franchise ,
      wo.is_new ,
      wo.rating,
      wo.opening_hours
    FROM
      woloo_wallets w
    JOIN woloos wo ON
      w.woloo_id = wo.id
    WHERE
      w.user_id = ${userId}
    ORDER BY
      w.created_at DESC
    LIMIT ${limit} OFFSET ${pageNumber}`,
      []
    );

  }


  async getHistoryCount(userId: any) {
    return await this._executeQuery(
      `SELECT  * 
       FROM  woloo_wallets w
        WHERE w.user_id = ?`,
      [userId]
    );
  }


  async submitReview(review: any) {
    return await this._executeQuery("insert into user_woloo_ratings set ?", [
      review,
    ]);
  }

  async updateFlag(
    user_id: number,
    woloo_id: number,
    is_review_pending: number
  ) {
    return await this._executeQuery(
      `update woloo_wallets set is_review_pending=0 WHERE user_id = ? and woloo_id=? and is_review_pending =?`,
      [user_id, woloo_id, is_review_pending]
    );
  }

  async insertWallet(data: any) {
    return await this._executeQuery(`insert into wallets set ?`, [data]);
  }

  async creditAmount(userId: number) {
    return await this._executeQuery(
      `SELECT SUM(w.value) as creditAmount FROM wallets  w where  w.transaction_type="CR" AND w.user_id=? AND w.is_gift=0`,
      [userId]
    );
  }

  async debitAmount(userId: number) {
    return await this._executeQuery(
      `SELECT SUM(w.value) as debitAmount FROM wallets w where  w.transaction_type="DR" AND w.user_id=? AND w.is_gift=0`,
      [userId]
    );
  }

  async giftCoinsCredit(userId: number) {
    return await this._executeQuery(
      `SELECT SUM(w.value) as giftCoinsCredit FROM wallets w where  w.transaction_type="CR" AND w.user_id=? AND w.is_gift=1`,
      [userId]
    );
  }

  async giftCoinsDebit(userId: number) {
    return await this._executeQuery(
      `SELECT SUM(w.value) as giftCoinsDebit FROM wallets w where  w.transaction_type="DR" AND w.user_id=? AND w.is_gift=1`,
      [userId]
    );
  }

  async giftCoinsCalculation(userId: number) {
    return await this._executeQuery(
      `select (select COALESCE(SUM(value), 0) from wallets where user_id = ${userId} and transaction_type = "CR" and is_gift=1) -  (select COALESCE(SUM(value), 0) from
      wallets where user_id = ${userId} and transaction_type = "DR" and is_gift = 1) as gift_points`,
      []
    );

  }


  async getReviewList(wolooId: any) {
    return await this._executeQuery(
      `SELECT engagement_type, count(*) as total FROM woloo_engagements where woloo_id=? and is_active=1 group by engagement_type`,
      [wolooId]
    );
  }

  // async wolooEngagementCount(wolooId: any) {
  //   return await this._executeQuery(
  //     `SELECT engagement_type, count(*) as total FROM woloo_engagements where woloo_id=? and is_active=1 group by engagement_type`,
  //     [wolooId]
  //   );
  // }

  async getWolooHost(
    pageSize: any,
    pageIndex: any,
    sortOrder: string,
    query: string
  ) {
    console.log( `SELECT w.id, w.code,w.name, w.title,w.image, w.opening_hours,
    w.restaurant,w.segregated,w.address, w.city,w.lat,w.lng,w.user_id,w.status,
    w.description,w.created_at, w.updated_at,w.deleted_at, w.is_covid_free,
    w.is_safe_space,w.is_clean_and_hygiene,w.is_sanitary_pads_available,
    w.is_makeup_room_available,w.is_coffee_available,w.is_sanitizer_available,
    w.is_feeding_room,w.is_wheelchair_accessible,w.is_washroom,w.is_premium,w.is_franchise,
    w.pincode,w.recommended_by,w.recommended_mobile,w.is_new, w.rating FROM woloos as w ${query}
   ${sortOrder}   LIMIT ? OFFSET ?`,pageSize, pageIndex)

    return await this._executeQuery(
      `SELECT w.id, w.code,w.name, w.title,w.image, w.opening_hours,
       w.restaurant,w.segregated,w.address, w.city,w.lat,w.lng,w.user_id,w.status,
       w.description,w.created_at, w.updated_at,w.deleted_at, w.is_covid_free,
       w.is_safe_space,w.is_clean_and_hygiene,w.is_sanitary_pads_available,
       w.is_makeup_room_available,w.is_coffee_available,w.is_sanitizer_available,
       w.is_feeding_room,w.is_wheelchair_accessible,w.is_washroom,w.is_premium,w.is_franchise,
       w.pincode,w.recommended_by,w.recommended_mobile,w.is_new, w.rating FROM woloos as w ${query}
      ${sortOrder}   LIMIT ? OFFSET ?`,
      [pageSize, pageIndex]
    );
  }

  async getWolooHostCount(query: any) {
    return await this._executeQuery(
      `SELECT COUNT(w.id)  as count FROM woloos as w ${query} `,
      []
    );
  }

  async getuserWolooRating(id: any) {
    return await this._executeQuery(
      `SELECT w.rating ,AVG(r.rating) as user_rating
       FROM woloos as w
       LEFT JOIN user_woloo_ratings r
       ON w.id = r.woloo_id where w.id=?; `,
      [id]
    );
  }

  async getWolooBusinessHours(id: any) {
    return await this._executeQuery(
      "SELECT id,open_time,close_time FROM woloo_business_hours where woloo_id=? and status = 1 ",
      [id]
    );
  }

  async updateBusinessHour(data: any, woloo_id: number) {
    return await this._executeQuery(
      "update woloo_business_hours set ? WHERE woloo_id = ?",
      [data, woloo_id]
    );
  }

  async getWolooHostById(id: any) {
    return await this._executeQuery(
      `SELECT w.id,w.mobile,w.email, w.code,w.name, w.title,w.image, w.opening_hours,
    w.restaurant,w.segregated,w.address, w.city,w.lat,w.lng,w.user_id,w.status,
    w.description,w.created_at, w.updated_at,w.deleted_at, w.is_covid_free,
    w.is_safe_space,w.is_clean_and_hygiene,w.is_sanitary_pads_available,
    w.is_makeup_room_available,w.is_coffee_available,w.is_sanitizer_available,
    w.is_feeding_room,w.is_wheelchair_accessible,w.is_washroom,w.is_premium,w.is_franchise,
    w.pincode,w.recommended_by,w.recommended_mobile,w.is_new  , w.rating , w.email, w.mobile FROM woloos as w where id = ?`,
      [id]
    );
  }

  async updateWolooHost(data: any, id: any) {
    if (id) {
      return await this._executeQuery("update woloos set ? where id = ? ", [
        data,
        id,
      ]);
    }
  }
  async createWolooHost(wolooData: any) {
  return await this._executeQuery("insert into woloos set ?", [wolooData]);
  }
  async insertBusinessHours(time: any) {
    return await this._executeQuery("insert into woloo_business_hours set ?", [
      time,
    ]);
  }

  async deleteWolooHostById(id: any, date: any) {
    return await this._executeQuery(
      "update woloos set status= 0, deleted_at =? WHERE id = ?",
      [date, id]
    );
  }

  async nearByWolooHost(lat: any, lng: any, raduis: any) {
    return await this._executeQuery(
      `SELECT w.*, 
        ( 3959 * acos( cos( radians(?) ) * cos( radians( lat ) )* cos( radians( lng ) - radians(?)) + sin( radians(?) ) *
        sin( radians( lat ) ) )) AS distance 
        FROM woloos w group by w.id having distance < ? limit 20`,
      [lat, lng, lat, raduis]
    );
  }
  async nearByWolooAndOfferCount(
    lat: any,
    lng: any,
    radius: any,
    limit: any,
    offset: any
  ) {
    return await this._executeQuery(
      `SELECT w.*, 
        ( 3959 * acos( cos( radians(?) ) * cos( radians( lat ) )* cos( radians( lng ) - radians(?)) + sin( radians(?) ) *
        sin( radians( lat ) ) )) AS distance 
        FROM woloos w left join woloo_business_hours bh on w.id = bh.woloo_id AND bh.status=1 WHERE w.status = 1 AND now() between bh.open_time and bh.close_time  group by w.id having distance < ? order by distance limit ? OFFSET ?`,
      [lat, lng, lat, radius, limit, offset]
    );
  }

  async getSettingradius() {
    return await this._executeQuery(
      `SELECT value FROM settings as w where w.key="site.maximum_radius"`,
      []
    );
  }
  async nearby_woloo_per_page() {
    return await this._executeQuery(
      `SELECT value FROM settings as w where w.key="site.nearby_woloo_per_page"`,
      []
    );
  }

  async getOfferCount() {
    return await this._executeQuery(
      `select count(*) as count from offers where end_date >= now() `,
      []
    );
  }

  // async nearByWolooHostSearch(lat: any, lng: any, raduis: any, limit: number) {
  //   return await this._executeQuery(
  //     `SELECT w.id, w.code, w.name, w.title, w.image, w.restaurant, w.segregated, w.address, w.city, w.lat, w.lng, w.user_id,w.status, w.description, concat(bh.open_time, "-" ,bh.close_time) as opening_hours,
  //            w.is_covid_free, w.is_safe_space, w.is_clean_and_hygiene, w.is_sanitary_pads_available, w.is_makeup_room_available, w.is_coffee_available, w.is_sanitizer_available, w.is_feeding_room, w.is_wheelchair_accessible, w.is_washroom, w.is_premium, w.is_franchise,
  //            w.pincode, w.recommended_by, w.recommended_mobile, w.is_new, w.created_at, w.updated_at, w.deleted_at, 
  //            we.engagement_type, we.user_id, rating.user_rating, rating.user_review_count,
  //            ( 3959 * acos( cos( radians(?) ) * cos( radians( lat ) )* cos( radians( lng ) - radians(?)) + sin( radians(?) ) * sin( radians( lat ) ) )) AS distance 
  //       FROM woloos w 
  //       left join woloo_engagements as we on  w.id = we.woloo_id
  //       left join woloo_business_hours bh on w.id = bh.woloo_id AND bh.status=1
  //       left join (SELECT woloo_id, user_rating, user_review_count
  //           FROM (SELECT r.woloo_id, Round(AVG(r.rating)) as user_rating, COUNT(*) as user_review_count
  //                   FROM user_woloo_ratings r
  //                   WHERE r.status = 1 
  //                   GROUP BY r.woloo_id
  //               ) p
  //           GROUP BY woloo_id) as rating on rating.woloo_id = w.id
  //       WHERE w.status = 1 AND now() between bh.open_time and bh.close_time    
  //       group by w.id having distance < ? order by distance limit ? ;`,
  //     [lat, lng, lat, raduis, limit]
  //   );
  // }

  async nearByWolooHostSearch(lat: any, lng: any, raduis: any, limit: number) {
    return await this._executeQuery(
      `SELECT w.id, w.code, w.name, w.title, w.image, w.restaurant, w.segregated, w.address, w.city, w.lat, w.lng, w.user_id,w.status, w.description, concat(bh.open_time, "-" ,bh.close_time) as opening_hours,
             w.is_covid_free, w.is_safe_space, w.is_clean_and_hygiene, w.is_sanitary_pads_available, w.is_makeup_room_available, w.is_coffee_available, w.is_sanitizer_available, w.is_feeding_room, w.is_wheelchair_accessible, w.is_washroom, w.is_premium, w.is_franchise,
             w.pincode, w.recommended_by, w.recommended_mobile, w.is_new, w.created_at, w.updated_at, w.deleted_at, 
             we.engagement_type, we.user_id, rating.user_rating, rating.user_review_count,
             ( 3959 * acos( cos( radians(?) ) * cos( radians( lat ) )* cos( radians( lng ) - radians(?)) + sin( radians(?) ) * sin( radians( lat ) ) )) AS distance 
        FROM woloos w 
        left join woloo_engagements as we on  w.id = we.woloo_id
        left join woloo_business_hours bh on w.id = bh.woloo_id AND bh.status=1
        left join (SELECT woloo_id, user_rating, user_review_count
            FROM (SELECT r.woloo_id, Round(AVG(r.rating)) as user_rating, COUNT(*) as user_review_count
                    FROM user_woloo_ratings r
                    WHERE r.status = 1 
                    GROUP BY r.woloo_id
                ) p
            GROUP BY woloo_id) as rating on rating.woloo_id = w.id
        WHERE w.status = 1 AND now() between bh.open_time and bh.close_time    
        group by w.id having distance < ? order by distance limit ? ;`,
      [lat, lng, lat, raduis, limit]
    );
  }

  async nearByWolooHostOffer(lat: any, lng: any, raduis: any, limit: number) {
    return await this._executeQuery(
      `SELECT
      w.id,
      w.code,
      w.name,
      w.title,
      w.image,
      w.restaurant,
      w.segregated,
      w.address,
      w.city,
      w.lat,
      w.lng,
      w.user_id,
      w.status,
      w.description,
      concat(bh.open_time, "-", bh.close_time) as opening_hours,
      w.is_covid_free,
      w.is_safe_space,
      w.is_clean_and_hygiene,
      w.is_sanitary_pads_available,
      w.is_makeup_room_available,
      w.is_coffee_available,
      w.is_sanitizer_available,
      w.is_feeding_room,
      w.is_wheelchair_accessible,
      w.is_washroom,
      w.is_premium,
      w.is_franchise,
      w.pincode,
      w.recommended_by,
      w.recommended_mobile,
      w.is_new,
      w.created_at,
      w.updated_at,
      w.deleted_at,
      we.engagement_type,
      we.user_id,
      rating.user_rating,
      rating.user_review_count,
      IF(of.id IS NOT NULL,
      JSON_OBJECT("id", of.id, "title", of.title, "description", of.description, "image", of.image, "start_date", of.start_date, "end_date", of.end_date),
      NULL) as offer,
      (3959 * ACOS(COS(RADIANS(?)) * COS(RADIANS(lat)) * COS(RADIANS(lng) - RADIANS(?)) + SIN(RADIANS(?)) * SIN(RADIANS(lat)))) AS distance
    FROM
      woloos w
    LEFT JOIN woloo_engagements as we ON
      w.id = we.woloo_id
    LEFT JOIN woloo_business_hours bh ON
      w.id = bh.woloo_id
      AND bh.status = 1
    LEFT JOIN offers as of ON
      w.id = of.woloo_id
      AND NOW() BETWEEN of.start_date AND of.end_date
    LEFT JOIN (
      SELECT
        woloo_id,
        user_rating,
        user_review_count
      FROM
        (
        SELECT
          r.woloo_id,
          ROUND(AVG(r.rating)) as user_rating,
          COUNT(*) as user_review_count
        FROM
          user_woloo_ratings r
        WHERE
          r.status = 1
        GROUP BY
          r.woloo_id
        ) p
      GROUP BY
        woloo_id
    ) as rating ON
      rating.woloo_id = w.id
    WHERE
      w.status = 1
      AND NOW() BETWEEN bh.open_time AND bh.close_time
      AND of.id IS NOT NULL
      -- Add this line to filter based on the presence of an offer
    GROUP BY
      w.id
    HAVING
      distance < ?
    ORDER BY
      distance
    LIMIT ?;
    `,
      [lat, lng, lat, raduis, limit]
    );
  }
  async nearByWolooHostShowAllOffer(
    lat: any,
    lng: any,
    raduis: any,
    limit: number
  ) {
    return await this._executeQuery(
      `SELECT
	w.id,
	w.code,
	w.name,
	w.title,
	w.image,
	w.restaurant,
	w.segregated,
	w.address,
	w.city,
	w.lat,
	w.lng,
	w.user_id,
	w.status,
	w.description,
	concat(bh.open_time, "-", bh.close_time) as opening_hours,
	w.is_covid_free,
	w.is_safe_space,
	w.is_clean_and_hygiene,
	w.is_sanitary_pads_available,
	w.is_makeup_room_available,
	w.is_coffee_available,
	w.is_sanitizer_available,
	w.is_feeding_room,
	w.is_wheelchair_accessible,
	w.is_washroom,
	w.is_premium,
	w.is_franchise,
	w.pincode,
	w.recommended_by,
	w.recommended_mobile,
	w.is_new,
	w.created_at,
	w.updated_at,
	w.deleted_at,
	we.engagement_type,
	we.user_id,
	rating.user_rating,
	rating.user_review_count,
	IF(of.id IS NOT NULL,
	JSON_OBJECT("id", of.id, "title", of.title, "description", of.description, "image", of.image, "start_date", of.start_date, "end_date", of.end_date),
	NULL) as offer,
	(3959 * ACOS(COS(RADIANS(?)) * COS(RADIANS(lat)) * COS(RADIANS(lng) - RADIANS(?)) + SIN(RADIANS(?)) * SIN(RADIANS(lat)))) AS distance
FROM
	woloos w
LEFT JOIN woloo_engagements as we ON
	w.id = we.woloo_id
LEFT JOIN woloo_business_hours bh ON
	w.id = bh.woloo_id
	AND bh.status = 1
LEFT JOIN offers as of ON
	w.id = of.woloo_id
	AND NOW() BETWEEN of.start_date AND of.end_date
LEFT JOIN (
	SELECT
		woloo_id,
		user_rating,
		user_review_count
	FROM
		(
		SELECT
			r.woloo_id,
			ROUND(AVG(r.rating)) as user_rating,
			COUNT(*) as user_review_count
		FROM
			user_woloo_ratings r
		WHERE
			r.status = 1
		GROUP BY
			r.woloo_id
    ) p
	GROUP BY
		woloo_id
) as rating ON
	rating.woloo_id = w.id
WHERE
	w.status = 1
	AND NOW() BETWEEN bh.open_time AND bh.close_time
	AND of.id IS NOT NULL
	-- Add this line to filter based on the presence of an offer
GROUP BY
	w.id
HAVING
	distance < ?
ORDER BY
	distance
LIMIT ?;
`,
      [lat, lng, lat, raduis, limit]
    );

  }
  async nearByWolooHostShowAllSearch(
    lat: any,
    lng: any,
    raduis: any,
    limit: number
  ) {
    return await this._executeQuery(
      `SELECT
      w.id,
      w.code,
      w.name,
      w.title,
      w.image,
      w.restaurant,
      w.segregated,
      w.address,
      w.city,
      w.lat,
      w.lng,
      w.user_id,
      w.status,
      w.description,
      concat(bh.open_time, "-" , bh.close_time) as opening_hours,
      w.is_covid_free,
      w.is_safe_space,
      w.is_clean_and_hygiene,
      w.is_sanitary_pads_available,
      w.is_makeup_room_available,
      w.is_coffee_available,
      w.is_sanitizer_available,
      w.is_feeding_room,
      w.is_wheelchair_accessible,
      w.is_washroom,
      w.is_premium,
      w.is_franchise,
      w.pincode,
      w.recommended_by,
      w.recommended_mobile,
      w.is_new,
      w.created_at,
      w.updated_at,
      w.deleted_at,
      we.engagement_type,
      we.user_id,
      rating.user_rating,
      rating.user_review_count,
      ( 3959 * acos( cos( radians(?) ) * cos( radians(lat) )* cos( radians(lng) - radians(?)) + sin( radians(?) ) * sin( radians(lat) ) )) AS distance
    FROM
      woloos w
    left join woloo_engagements as we on
      w.id = we.woloo_id
    left join woloo_business_hours bh on
      w.id = bh.woloo_id
      AND bh.status = 1
    left join (
      SELECT
        woloo_id,
        user_rating,
        user_review_count
      FROM
        (
        SELECT
          r.woloo_id,
          Round(AVG(r.rating)) as user_rating,
          COUNT(*) as user_review_count
        FROM
          user_woloo_ratings r
        WHERE
          r.status = 1
        GROUP BY
          r.woloo_id
                    ) p
      GROUP BY
        woloo_id) as rating on
      rating.woloo_id = w.id
    WHERE
      w.status = 1
    group by
      w.id
    having
      distance < ?
    order by
      distance
    limit ? ;`,
      [lat, lng, lat, raduis, limit]
    );
  }

  async userWolooEnagement(user_id: number, woloo_id: number) {
    return await this._executeQuery(
      "SELECT engagement_type, is_active FROM woloo_engagements where user_id = ? and woloo_id = ?",
      [user_id, woloo_id]
    );
  }

  async selectIdFromWoloos(codes: any) {
    return await this._executeQuery(
      "Select id, code from woloos where code in (?)",
      [codes]
    );
  }

  async selectIdandCodeFromId(codes: any) {
    return await this._executeQuery(
      "Select id, code from woloos where id in (?)",
      [codes]
    );
  }

  async wolooRatingPercentage() {
    return await this._executeQuery(
      "SELECT s.key,s.value FROM settings as s where s.key ='woloo_rating_percentage' || s.key= 'user_rating_percentage'",
      []
    );
  }
  async ownerHistory(
    pageSize: any,
    pageIndex: any,
    sortOrder: string,
    isPaginated: boolean,
    query:any
  ) {
    var values = isPaginated ? [pageSize, pageIndex] : [];
    var append = isPaginated ? "LIMIT ? OFFSET ?" : "";
    
    return await this._executeQuery(
      `SELECT users.id,users.name  as owner_name,ro.display_name as owner_type,users.city,users.mobile,users.pincode,users.address,users.email,users.ref_code,ifnull(icount.count,0) as active_count,ifnull(incount.count,0) as inactive_count,(cr_gift_sum-dr_gift_sum) as gift_points,(cr_sum-dr_sum) as other_points FROM users 
      left join roles as ro on users.role_id = ro.id
      left join (
        SELECT us.id,
              IFNULL(cr_sum.sum, 0) AS cr_sum,IFNULL(dr_sum.sum, 0) AS dr_sum
              FROM wallets AS w 
              LEFT JOIN users AS us ON w.user_id = us.id
              LEFT JOIN (SELECT user_id, transaction_type, SUM(value) AS sum FROM wallets
              WHERE transaction_type = 'CR' and  is_gift = 0
              GROUP BY user_id) AS cr_sum ON cr_sum.user_id = w.user_id
              LEFT JOIN (SELECT user_id, transaction_type, SUM(value) AS sum FROM wallets
              WHERE transaction_type = 'DR' and is_gift = 0
              GROUP BY user_id) AS dr_sum ON dr_sum.user_id = w.user_id
              GROUP BY us.id  
              )as wallet_count on wallet_count.id = users.id
	 left join (
        SELECT us.id,
              IFNULL(cr_sum.sum, 0) AS cr_gift_sum,IFNULL(dr_sum.sum, 0) AS dr_gift_sum
              FROM wallets AS w 
              LEFT JOIN users AS us ON w.user_id = us.id
              LEFT JOIN (SELECT user_id, transaction_type, SUM(value) AS sum FROM wallets
              WHERE transaction_type = 'CR' and  is_gift = 1
              GROUP BY user_id) AS cr_sum ON cr_sum.user_id = w.user_id
              LEFT JOIN (SELECT user_id, transaction_type, SUM(value) AS sum FROM wallets
              WHERE transaction_type = 'DR' and is_gift = 1
              GROUP BY user_id) AS dr_sum ON dr_sum.user_id = w.user_id
              GROUP BY us.id  
              )as wallet_gift_count on wallet_gift_count.id = users.id
      left join (SELECT sponsor_id,count(sponsor_id) as count from users WHERE expiry_date >= now() group by sponsor_id) as icount on icount.sponsor_id = users.id 
      left join (SELECT sponsor_id,COUNT(sponsor_id) as count FROM users WHERE expiry_date < now() Group by sponsor_id) as incount on incount.sponsor_id = users.id 
            ${query}  
      Group by id having active_count >0 or inactive_count>0 ${sortOrder}  ${append}`,
      values
    );
  }
  async getOwnerHistoryCount(sortOrder: string,query:any) {
    return await this._executeQuery(
      `SELECT users.id,users.name  as owner_name,ro.display_name as owner_type,users.city,users.mobile,users.pincode,users.address,users.email,users.ref_code,ifnull(icount.count,0) as active_count,ifnull(incount.count,0) as inactive_count FROM users left join roles as ro on users.role_id = ro.id left join (SELECT sponsor_id,count(sponsor_id) as count from users WHERE expiry_date >= now() group by sponsor_id) as icount on icount.sponsor_id = users.id left join (SELECT sponsor_id,COUNT(sponsor_id) as count FROM users WHERE expiry_date < now() Group by sponsor_id) as incount on incount.sponsor_id = users.id  ${query}  Group by id having active_count >0 or inactive_count>0 ${sortOrder} `,
      []
    );
  }
  async recommendWoloo(wolooData: any) {
    return await this._executeQuery("insert into woloos set ?", [wolooData]);
  }
  async userRecommendWoloo(userId: number) {
    return await this._executeQuery(
      `SELECT * FROM woloos where recommended_by=${userId}`,
      []
    );
  }
  async getNewWoloo() {
    return await this._executeQuery(
      `select id from woloos order by id desc limit 1`,
      []
    );
  }
  async getSettingValue() {
    return await this._executeQuery(
      "select s.value from settings  as s where s.key = 'site.before_approve_recommend_woloo_points'",
      []
    );
  }
  async insertdevicePayload(
    deviceId: number,
    type: any,
    ppm: any,
    org_name: any,
    location_name: any,
    sub_location: any,
    ppm_time: any
  ) {
    return await this._executeQuery(
      "insert into iot_devices (deviceId, type, ppm, org_name,location_name,sub_location,ppm_time) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [deviceId, type, ppm, org_name, location_name, sub_location, ppm_time]
    );
  }
  async enrouteWoloo(query: any) {
    return await this._executeQuery(`SELECT * FROM woloos ${query};`, []);
  }

  async getUserIdbyWolooId(id: any) {
    return await this._executeQuery(`SELECT user_id FROM woloos where id=${id};`, []);
  }

  async getWolooByEmail(email: string) {
    let result = await this._executeQuery(
      `SELECT * FROM woloos WHERE email = '${email}'`,
      []
    );
    return result;
  }

  async getWolooByMobile(mobile: string) {
    let result = await this._executeQuery(
      `SELECT * FROM woloos WHERE mobile = '${mobile}'`,
      []
    );
    return result;
  }

}
