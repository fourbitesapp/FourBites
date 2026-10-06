package com.fourbites.backend.util;

public final class Distancia {

    private static final double RAIO_DA_TERRA_KM = 6371.0;

    private Distancia() {
    }

    public static double emKm(double latitude1, double longitude1, double latitude2, double longitude2) {
        double diferencaLatitude = Math.toRadians(latitude2 - latitude1);
        double diferencaLongitude = Math.toRadians(longitude2 - longitude1);

        double a = Math.sin(diferencaLatitude / 2) * Math.sin(diferencaLatitude / 2)
                + Math.cos(Math.toRadians(latitude1)) * Math.cos(Math.toRadians(latitude2))
                * Math.sin(diferencaLongitude / 2) * Math.sin(diferencaLongitude / 2);

        double anguloCentral = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return RAIO_DA_TERRA_KM * anguloCentral;
    }
}