package app

import (
	"fmt"
	"log"
	"net"

	"google.golang.org/grpc" // dir to go
)

type App struct {
	grpcServer     *grpc.Server
	configGRPCPort string `8080`

	start bool
}

func NewApp() *App {
	app := &App{}
	return app
}

func (app *App) Start() {
	grpcAddr := fmt.Sprintf(":%s", app.configGRPCPort)
	lis, err := net.Listen("tcp", grpcAddr)

	if err != nil {
		panic(fmt.Errorf("failed to grpc listen on %s, error :%v", app.configGRPCPort, err))
	}

	log.Printf("Serving gRPC on 0.0.0.0:%s\n", app.configGRPCPort)

	go func() {
		app.grpcServer.Serve(lis)
	}()
	app.start = true
}

func (app *App) Stop() {
	app.start = false
}
