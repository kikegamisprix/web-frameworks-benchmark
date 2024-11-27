FROM rust:1.82 as builder

WORKDIR /usr/src/app
COPY . .

RUN cargo build --release

FROM debian:bookworm-slim
COPY --from=builder /usr/src/app/target/release/rust-benchmark /usr/local/bin/

EXPOSE 8090
CMD ["rust-benchmark"]