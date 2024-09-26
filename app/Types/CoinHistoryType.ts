export interface Data {
    total_count: number;
    history_count: number;
    history: HistoryItem[];
    next?: number | null;
    last_page?: number | null;
}

export interface HistoryItem {
    woloo_details: WolooDetails;
    sender_receiver_id: number;
    created_at: string;
    transaction_type: string;
    message: string;
    type: string;
    is_expired: number;
    is_gift: number;
    updated_at: string;
    user_id: number;
    id: number;
    woloo_id: number;
    value: string;
    remarks: string;
    status: number;
    expired_on: null | Object;
    sender: Sender;
}
export interface WolooDetails {
    code: string;
    city: string;
    description: string;
    created_at: string;
    title: string;
    is_safe_space: number;
    updated_at: string;
    is_feeding_room: number;
    recommended_by: number;
    id: number;
    is_sanitizer_available: number;
    lat: string;
    user_rating: string;
    pincode: number;
    address: string;
    user_review_count: number;
    lng: string;
    is_makeup_room_available: number;
    restaurant: string;
    is_clean_and_hygiene: number;
    is_washroom: number;
    deleted_at: string | null;
    is_coffee_available: number;
    is_wheelchair_accessible: number;
    is_sanitary_pads_available: number;
    is_franchise: number;
    is_premium: number;
    user_id: string;
    name: string;
    opening_hours: string;
    recommended_mobile: string;
    segregated: string;
    status: number;
    is_covid_free: number;
}

export interface Sender {
    gender: string;
    city: string;
    created_at: string;
    is_first_session: number;
    ref_code: string;
    subscription_id: string;
    updated_at: string;
    role_id: string;
    id: number;
    woloo_id: string;
    email: string;
    pincode: string;
    // settings: string[]; // Uncomment if `settings` is an array of strings
    address: string;
    expiry_date: string;
    mobile: string;
    otp: number;
    avatar: string;
    sponsor_id: string;
    deleted_at: string;
    gp_id: string;
    fb_id: string;
    dob: string;
    name: string;
    voucher_id: string;
    status: string;
}
