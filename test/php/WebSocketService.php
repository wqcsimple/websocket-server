<?php
namespace app\services;


class WebSocketService
{
    const KEY_WHIS_WEBSOCKET_MESSAGE = 'whis.websocket.message';

    const EVENT_NEW_WAYBILL = 1;

    public static function pushMessage($event, $user_id, $user_type, $data)
    {
        $redis = Redis::client();

        $redis->publish(self::KEY_WHIS_WEBSOCKET_MESSAGE, json_encode([
            'event' => $event,
            'user_id' => strval($user_id),
            'user_type' => intval($user_type),
            'data' => $data,
            'time' => time()
        ]));
    }

    public static function pushNewEventMessage($admin_id, $waybill_id, $message, $sound = null)
    {
        $data = [
            'whis' => 'whis'
        ];
        if ($sound) {
            $data['sound'] = intval($sound);
        }
        self::pushMessage(self::EVENT_NEW_WAYBILL, $admin_id, DXConst::OPERATOR_TYPE_ADMIN, $data);
    }

    public static function pushNewEventMessageToUsers($waybill_id, $message, $sound = null)
    {
        $admin_id_list = [1, 2, 3]; // 指定用户id
        $admin_id = implode(',', $admin_id_list);
        self::pushNewEventMessage($admin_id, $waybill_id, $message, $sound);
    }


}